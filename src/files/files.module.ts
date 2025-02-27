import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './file.model';
import { Folder } from '../folders/folder.model';
import { FoldersModule } from '../folders/folders.module';
import { BullModule } from '@nestjs/bull';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    SequelizeModule.forFeature([File, Folder]),
    FoldersModule,
    PermissionsModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'file-queue',
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
