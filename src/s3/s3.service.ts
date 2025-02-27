import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { s3 } from '../../config/aws.config';

@Injectable()
export class S3Service {
  private readonly bucketName = process.env.AWS_S3_BUCKET_NAME;

  private checkBucketName(): void {
    if (!this.bucketName) {
      throw new InternalServerErrorException(
        'AWS S3 bucket name is not defined',
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folderPath: string,
  ): Promise<ManagedUpload.SendData> {
    this.checkBucketName();

    const params: any = {
      Bucket: this.bucketName,
      Key: `${folderPath}/${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    return s3.upload(params).promise();
  }

  async deleteFile(fileKey: string): Promise<void> {
    this.checkBucketName();

    const params: any = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    await s3.deleteObject(params).promise();
  }

  async getFileUrl(fileKey: string): Promise<string> {
    this.checkBucketName();

    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
      Expires: 3600,
    };

    return s3.getSignedUrl('getObject', params);
  }
}
