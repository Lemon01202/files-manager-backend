import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Delete,
  Get,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { Response } from 'express';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('upload/:folderPath')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folderPath') folderPath: string,
  ) {
    if (!file) {
      throw new NotFoundException('File not found');
    }

    const result = await this.s3Service.uploadFile(file, folderPath);
    return {
      message: 'File uploaded successfully',
      fileUrl: result.Location,
    };
  }

  @Delete('delete/:fileKey')
  async deleteFile(@Param('fileKey') fileKey: string) {
    await this.s3Service.deleteFile(fileKey);
    return { message: 'File deleted successfully' };
  }

  @Get('download/:fileKey')
  async downloadFile(@Param('fileKey') fileKey: string, @Res() res: Response) {
    const fileUrl = await this.s3Service.getFileUrl(fileKey);
    res.redirect(fileUrl);
  }
}
