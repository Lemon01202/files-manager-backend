import { ForbiddenException } from '@nestjs/common';
import { PermissionsService } from '../permissions/permissions.service';

export const checkPermission = async (
  email: string,
  fileId: number,
  requiredAction: 'view' | 'edit',
  permissionsService: PermissionsService,
): Promise<void> => {
  const permissions = await permissionsService.getPermissionsForUser(email);
  const hasPermission = permissions.some(
    (permission) =>
      permission.fileId === fileId && permission.action === requiredAction,
  );
  if (!hasPermission) {
    throw new ForbiddenException(
      'You do not have permission to perform this action',
    );
  }
};
