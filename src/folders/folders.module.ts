import { forwardRef, Module } from '@nestjs/common';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Folder } from './folder.model';
import { PermissionsModule } from '../permissions/permissions.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Folder]),
    PermissionsModule,
    forwardRef(() => FilesModule),
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
