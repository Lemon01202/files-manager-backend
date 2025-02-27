import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign permissions to a file' })
  async assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.permissionsService.assignPermission(
      assignPermissionDto.email,
      assignPermissionDto.fileId,
      assignPermissionDto.action,
    );
  }

  @Get(':email')
  @ApiOperation({ summary: 'Get permissions for a user' })
  async getPermissionsForUser(@Param('email') email: string) {
    return this.permissionsService.getPermissionsForUser(email);
  }
}
