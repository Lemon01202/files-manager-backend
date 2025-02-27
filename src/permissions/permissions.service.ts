import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Permission } from './permission.model';
import { User } from '../users/user.model';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission)
    private readonly permissionModel: typeof Permission,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async assignPermission(
    email: string,
    fileId: number,
    action: 'view' | 'edit',
  ) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return await this.permissionModel.create({
      userId: user.id,
      fileId,
      action,
      email,
    });
  }

  async getPermissionsForUser(email: string) {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      return [];
    }
    return await this.permissionModel.findAll({ where: { userId: user.id } });
  }

  async deletePermissionsByFileId(fileId: number) {
    await this.permissionModel.destroy({
      where: { fileId },
    });
  }
}
