import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Folder } from './folder.model';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { Op } from 'sequelize';
import { FilesService } from '../files/files.service';
import { WhereOptions } from 'sequelize';

@Injectable()
export class FoldersService {
  private readonly baseFolderPath = path.join(process.cwd(), 'folders');

  constructor(
    @InjectModel(Folder) private readonly folderModel: typeof Folder,
    private readonly filesService: FilesService,
  ) {
    if (!fs.existsSync(this.baseFolderPath)) {
      fs.mkdirSync(this.baseFolderPath, { recursive: true });
    }
  }

  async createFolder(folderName: string, parentFolderId?: number) {
    const folder = await this.folderModel.create({
      folderName,
      parentFolderId,
    });

    let folderPath = this.baseFolderPath;

    if (parentFolderId) {
      const parentFolder = await this.folderModel.findByPk(parentFolderId);
      if (parentFolder) {
        folderPath = await this.getFolderPath(parentFolder);
      }
    }

    const finalPath = path.join(folderPath, folderName);
    if (!fs.existsSync(finalPath)) {
      fs.mkdirSync(finalPath, { recursive: true });
    }

    return folder;
  }

  async getFolderPath(folder: Folder): Promise<string> {
    let currentFolder: Folder | null = folder;
    let folderPath = currentFolder.folderName;

    while (currentFolder?.parentFolderId) {
      currentFolder = await this.folderModel.findByPk(
        currentFolder.parentFolderId,
      );
      if (!currentFolder) break;

      folderPath = path.join(currentFolder.folderName, folderPath);
    }

    return path.join(this.baseFolderPath, folderPath);
  }

  async getRootFolders(name?: string) {
    const whereClause = {
      parentFolderId: { [Op.is]: null },
      ...(name?.trim() && {
        folderName: { [Op.iLike]: `%${name.trim()}%` },
      }),
    };

    return await this.folderModel.findAll({ where: whereClause });
  }

  async getChildFolders(parentFolderId: number | string, name?: string) {
    const whereClause: WhereOptions<Folder> = {};

    if (parentFolderId === 'all') {
      if (name?.trim()) {
        whereClause.folderName = { [Op.iLike]: `%${name.trim()}%` };
      }
      return await this.folderModel.findAll({ where: whereClause });
    }

    whereClause.parentFolderId = Number(parentFolderId);

    if (name?.trim()) {
      whereClause.folderName = { [Op.iLike]: `%${name.trim()}%` };
    }

    return await this.folderModel.findAll({ where: whereClause });
  }

  async deleteFolder(folderId: number) {
    const folder = await this.folderModel.findByPk(folderId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const folderPath = await this.getFolderPath(folder);

    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }

    await this.folderModel.destroy({ where: { id: folderId } });

    return { message: 'Folder deleted successfully' };
  }

  async updateFolder(folderId: number, updateFolderDto: UpdateFolderDto) {
    const folder = await this.folderModel.findByPk(folderId);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    const oldFolderPath = await this.getFolderPath(folder);
    folder.folderName = updateFolderDto.folderName;
    await folder.save();

    const newFolderPath = await this.getFolderPath(folder);

    if (fs.existsSync(oldFolderPath)) {
      fs.renameSync(oldFolderPath, newFolderPath);
    }

    await this.filesService.updateFilePathsForFolder(
      oldFolderPath,
      newFolderPath,
    );

    return { message: 'Folder updated successfully' };
  }

  async getAllFolders(name?: string) {
    const whereClause: WhereOptions<Folder> = {};

    if (name?.trim()) {
      whereClause.folderName = { [Op.iLike]: `%${name.trim()}%` };
    }

    return await this.folderModel.findAll({ where: whereClause });
  }
}
