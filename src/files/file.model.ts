import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Folder } from '../folders/folder.model';

@Table
export class File extends Model {
  @Column
  fileName: string;

  @Column
  filePath: string;

  @Column
  size: number;

  @Column
  mimeType: string;

  @Column
  isPublic: boolean;

  @ForeignKey(() => Folder)
  @Column
  folderId: number;

  @BelongsTo(() => Folder)
  folder: Folder;
}
