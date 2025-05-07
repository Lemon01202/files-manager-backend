import * as path from 'path';
import { Folder } from '../folders/folder.model';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

export const getBaseFilePath = () => path.join(process.cwd(), 'folders');

export const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const getFilePath = async (
  baseFilePath: string,
  folderId: number | undefined,
  fileName: string,
  folderModel: typeof Folder,
): Promise<string> => {
  let filePath = baseFilePath;
  if (folderId) {
    const folder = await folderModel.findByPk(folderId);
    if (!folder) throw new NotFoundException('Folder not found');
    const folderPath = await getFolderPath(folder, folderModel);
    if (!folderPath) throw new Error('Failed to determine folder path');
    filePath = path.join(folderPath, fileName);
  } else {
    filePath = path.join(baseFilePath, fileName);
  }
  return filePath;
};

export const getFolderPath = async (
  folder: Folder,
  folderModel: typeof Folder,
): Promise<string> => {
  let currentFolder: Folder | null = folder;
  let folderPath = currentFolder.folderName;
  while (currentFolder?.parentFolderId) {
    currentFolder = await folderModel.findByPk(currentFolder.parentFolderId);
    if (!currentFolder) break;
    folderPath = path.join(currentFolder.folderName, folderPath);
  }
  return path.join(getBaseFilePath(), folderPath);
};
