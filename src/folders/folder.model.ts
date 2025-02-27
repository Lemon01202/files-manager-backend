import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Folder extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  folderName: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  parentFolderId: number;
}
