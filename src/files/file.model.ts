import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Folder } from '../folders/folder.model';
import { ApiProperty } from '@nestjs/swagger';

@Table
export class File extends Model {
  @ApiProperty()
  @Column
  fileName: string;

  @ApiProperty()
  @Column
  filePath: string;

  @ApiProperty()
  @Column
  size: number;

  @ApiProperty()
  @Column
  mimeType: string;

  @ApiProperty()
  @Column
  isPublic: boolean;

  @ApiProperty()
  @ForeignKey(() => Folder)
  @Column
  folderId: number;

  @ApiProperty({ type: () => Folder })
  @BelongsTo(() => Folder)
  folder: Folder;
}
