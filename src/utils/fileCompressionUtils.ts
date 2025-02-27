import * as sharp from 'sharp';
import * as path from 'path';

export const compressFile = async (filePath: string): Promise<string> => {
  const ext = path.extname(filePath);
  const webpFilePath = filePath.replace(ext, '.webp');
  try {
    await sharp(filePath)
      .resize(800, 800, { fit: 'inside' })
      .toFormat('webp', { quality: 80 })
      .toFile(webpFilePath);
    return webpFilePath;
  } catch (error) {
    throw new Error(`Error compressing file: ${error.message}`);
  }
};
