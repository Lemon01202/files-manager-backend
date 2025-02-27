import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Permission extends Model {
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
  action: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  fileId: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;
}
