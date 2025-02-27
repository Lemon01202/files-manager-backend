import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as sharp from 'sharp';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileProcessor implements OnModuleInit {
  private readonly outputDir = path.join(process.cwd(), 'compressed');

  constructor(@InjectQueue('file-queue') private readonly fileQueue: Queue) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async onModuleInit() {
    await this.fileQueue.process('compress-image', async (job) =>
      this.handleImageCompression(job),
    );
    await this.fileQueue.process('compress-video', async (job) =>
      this.handleVideoCompression(job),
    );
  }

  private async handleImageCompression(job: any) {
    const { filePath } = job.data;
    const compressedPath = path.join(this.outputDir, path.basename(filePath));

    await sharp(filePath)
      .resize(1024)
      .jpeg({ quality: 80 })
      .toFile(compressedPath);

    return { compressedPath };
  }

  private async handleVideoCompression(job: any) {
    const { filePath } = job.data;
    const compressedPath = path.join(this.outputDir, path.basename(filePath));

    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .output(compressedPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .size('720x?')
        .on('end', () => resolve({ compressedPath }))
        .on('error', (err) => reject(err))
        .run();
    });
  }
}
