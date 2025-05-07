import { Table, Column, Model, DataType } from 'sequelize-typescript';

export interface UserCreationAttributes {
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

@Table
export class User extends Model<User, UserCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  picture: string;

  @Column({
    type: DataType.NUMBER,
    allowNull: true,
  })
  googleId: number;
}
