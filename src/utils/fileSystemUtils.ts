import * as fs from 'fs';
import * as path from 'path';

export const deleteFileIfExists = (filePath: string): void => {
  const fullPath = path.join(process.cwd(), 'folders', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

export const writeFile = (filePath: string, buffer: Buffer): void => {
  fs.writeFileSync(filePath, buffer);
};
