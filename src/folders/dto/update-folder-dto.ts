import { ApiProperty } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiProperty({ description: 'New folder name' })
  folderName: string;
}
