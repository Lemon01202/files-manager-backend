import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { File } from './file.model';
import { Op } from 'sequelize';
import * as path from 'path';
import { Folder } from '../folders/folder.model';
import { PermissionsService } from '../permissions/permissions.service';
import {
  getBaseFilePath,
  ensureDirectoryExists,
  getFilePath,
} from '../utils/filePathUtils';
import { compressFile } from '../utils/fileCompressionUtils';
import { deleteFileIfExists, writeFile } from '../utils/fileSystemUtils';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  private readonly baseFilePath = getBaseFilePath();

  constructor(
    @InjectModel(File) private readonly fileModel: typeof File,
    @InjectModel(Folder) private readonly folderModel: typeof Folder,
    private readonly permissionsService: PermissionsService,
  ) {
    ensureDirectoryExists(this.baseFilePath);
  }

  async uploadFile(
    file: Express.Multer.File,
    isPublic: boolean,
    folderId?: number,
    email?: string,
  ) {
    ensureDirectoryExists(this.baseFilePath);

    const filePath = await getFilePath(
      this.baseFilePath,
      folderId,
      file.originalname,
      this.folderModel,
    );

    writeFile(filePath, file.buffer);

    let compressedFilePath = filePath;
    if (file.mimetype.startsWith('image/')) {
      try {
        compressedFilePath = await compressFile(filePath);
      } catch (error) {
        console.error('Error compressing image:', error.message);
      }
    }

    const relativeFilePath = path.relative(
      this.baseFilePath,
      compressedFilePath,
    );

    const newFile = await this.fileModel.create({
      fileName: path.basename(compressedFilePath),
      filePath: path.join('/', relativeFilePath),
      size: file.size,
      mimeType: file.mimetype,
      isPublic,
      folderId,
    });

    if (email) {
      await this.permissionsService.assignPermission(email, newFile.id, 'edit');
    }

    return newFile;
  }

  async updateFilePathsForFolder(oldFolderPath: string, newFolderPath: string) {
    const oldFolderId = oldFolderPath.split('/').pop();
    const newFolderId = newFolderPath.split('/').pop();

    const files = await this.fileModel.findAll({
      where: { filePath: { [Op.like]: `/${oldFolderId}/%` } },
    });

    for (const file of files) {
      const newFilePath = file.filePath.replace(
        `/${oldFolderId}/`,
        `/${newFolderId}/`,
      );
      await file.update({ filePath: newFilePath });
    }
  }

  async getFilesByFolderId(
    folderId: number | string | null,
    name?: string,
    email?: string,
  ) {
    const whereClause: any = {};
    if (folderId === 'null' || folderId === null) {
      whereClause.folderId = { [Op.is]: null };
    } else {
      whereClause.folderId = Number(folderId);
    }
    if (name && name.trim()) {
      whereClause.fileName = { [Op.iLike]: `%${name.trim()}%` };
    }

    const files = await this.fileModel.findAll({ where: whereClause });

    if (!email) {
      return files
        .filter((file) => file.isPublic)
        .sort((a, b) => a.fileName.localeCompare(b.fileName))
        .map((file) => ({
          ...file.toJSON(),
          actions: file.isPublic ? ['view'] : [],
        }));
    }

    const permissions =
      await this.permissionsService.getPermissionsForUser(email);
    const fileIdsWithAccess = permissions.map(
      (permission) => permission.fileId,
    );

    return files
      .filter((file) => file.isPublic || fileIdsWithAccess.includes(file.id))
      .sort((a, b) => a.fileName.localeCompare(b.fileName))
      .map((file) => {
        const filePermissions = permissions.filter(
          (permission) => permission.fileId === file.id,
        );
        const actions = filePermissions.map((permission) => permission.action);
        if (file.isPublic) actions.push('view');
        return { ...file.toJSON(), actions: Array.from(new Set(actions)) };
      });
  }

  async getFile(id: number, email: string) {
    const file = await this.fileModel.findByPk(id);
    if (!file) throw new NotFoundException('File not found');
    return file;
  }

  async toggleFilePrivacy(id: number, email: string) {
    const file = await this.getFile(id, email);
    const newPrivacyStatus = !file.isPublic;
    return await file.update({ isPublic: newPrivacyStatus });
  }

  async deleteFile(id: number, email: string) {
    const file = await this.getFile(id, email);
    deleteFileIfExists(file.filePath);
    await this.permissionsService.deletePermissionsByFileId(id);
    await file.destroy();
    return { message: 'File deleted' };
  }

  async updateFile(
    id: number,
    file: Express.Multer.File | null,
    updateData: Partial<File> & { isPublic?: boolean },
    email: string,
  ) {
    const existingFile = await this.getFile(id, email);

    if (file) {
      const filePath = await getFilePath(
        this.baseFilePath,
        existingFile.folderId,
        file.originalname,
        this.folderModel,
      );
      deleteFileIfExists(existingFile.filePath);
      writeFile(filePath, file.buffer);

      let compressedFilePath = filePath;
      if (file.mimetype.startsWith('image/')) {
        try {
          compressedFilePath = await compressFile(filePath);
          if (compressedFilePath !== filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error('Error compressing image:', error.message);
        }
      }

      const relativeFilePath = path.relative(
        this.baseFilePath,
        compressedFilePath,
      );
      updateData.fileName = path.basename(compressedFilePath);
      updateData.filePath = path.join('/', relativeFilePath);
      updateData.size = file.size;
      updateData.mimeType = file.mimetype;
    }

    return await existingFile.update(updateData);
  }

  async setFilePrivacy(id: number, isPublic: boolean, email: string) {
    const file = await this.getFile(id, email);

    return await file.update({ isPublic });
  }

  async shareFileAccess(
    id: number,
    email: string,
    permission: 'view' | 'edit',
  ) {
    return this.permissionsService.assignPermission(email, id, permission);
  }

  async getFilesByUserEmail(email: string) {
    const publicFiles = await this.fileModel.findAll({
      where: { isPublic: true },
    });
    const permissions =
      await this.permissionsService.getPermissionsForUser(email);
    const fileIdsWithAccess = permissions.map(
      (permission) => permission.fileId,
    );
    const privateFiles = await this.fileModel.findAll({
      where: { id: fileIdsWithAccess, isPublic: false },
    });
    return [...publicFiles, ...privateFiles];
  }
}
