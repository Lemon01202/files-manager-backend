import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  folderId?: number;
}

export class UpdateFileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  folderId?: number;
}

export class ShareFileDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ enum: ['view', 'edit'] })
  permission: 'view' | 'edit';
}
