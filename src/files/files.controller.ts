import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { AuthGuard } from '@nestjs/passport';
import { UploadFileDto, UpdateFileDto, ShareFileDto } from './dto/file.dto';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'File upload', type: UploadFileDto })
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 201, description: 'File successfully uploaded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    const email = req.user.email;
    return this.filesService.uploadFile(
      file,
      uploadFileDto.isPublic,
      uploadFileDto.folderId,
      email,
    );
  }

  @Get('by-folder/:id')
  @ApiOperation({ summary: 'Get files by folder ID' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Files list' })
  async getFilesByFolderId(
    @Request() req,
    @Param('id') folderId: string,
    @Query('name') name?: string,
  ) {
    const email = req.user.email;
    const parsedFolderId =
      folderId === 'null' || folderId === '0' ? null : Number(folderId);
    return this.filesService.getFilesByFolderId(parsedFolderId, name, email);
  }

  @Patch(':id/privacy')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Toggle file privacy' })
  @ApiBearerAuth()
  async toggleFilePrivacy(@Param('id') id: number, @Request() req) {
    const email = req.user.email;
    return this.filesService.toggleFilePrivacy(id, email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiBearerAuth()
  async getFile(@Param('id') id: number, @Request() req) {
    const email = req.user.email;
    return this.filesService.getFile(id, email);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete file by ID' })
  @ApiBearerAuth()
  async deleteFile(@Param('id') id: number, @Request() req) {
    const email = req.user.email;
    return this.filesService.deleteFile(id, email);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update file details' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Update file data', type: UpdateFileDto })
  @ApiBearerAuth()
  async updateFile(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateData: UpdateFileDto,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.filesService.updateFile(id, file, updateData, email);
  }

  @Patch(':id/privacy')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update file privacy' })
  @ApiBearerAuth()
  async setFilePrivacy(
    @Param('id') id: number,
    @Body('isPublic') isPublic: boolean,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.filesService.setFilePrivacy(id, isPublic, email);
  }

  @Post(':id/share')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Share file access' })
  @ApiBody({ type: ShareFileDto })
  @ApiBearerAuth()
  async shareFileAccess(
    @Param('id') id: number,
    @Body() shareFileDto: ShareFileDto,
    @Request() req,
  ) {
    return this.filesService.shareFileAccess(
      id,
      shareFileDto.email,
      shareFileDto.permission,
    );
  }
}
