import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'Documents', description: 'Folder name' })
  folderName: string;

  @ApiProperty({
    example: 1,
    description: 'Parent folder id',
    required: false,
  })
  parentFolderId?: number;
}
