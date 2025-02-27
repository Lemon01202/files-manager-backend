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
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard('jwt'))
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPublic') isPublic: boolean,
    @Body('folderId') folderId?: number,
  ) {
    const email = req.user.email;
    return this.filesService.uploadFile(file, isPublic, folderId, email);
  }

  @Get('by-folder/:id')
  @ApiOperation({ summary: 'Get files by folder ID' })
  @UseGuards(AuthGuard('jwt'))
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
  async toggleFilePrivacy(@Param('id') id: number, @Request() req) {
    const email = req.user.email;
    return this.filesService.toggleFilePrivacy(id, email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  async getFile(@Param('id') id: number, @Request() req) {
    const email = req.user.email;
    return this.filesService.getFile(id, email);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete file by ID' })
  async deleteFile(@Param('id') id: number, @Request() req) {
    const email = req.user.email;
    return this.filesService.deleteFile(id, email);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Update file details' })
  async updateFile(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateData: any,
    @Request() req,
  ) {
    const email = req.user.email;
    return this.filesService.updateFile(id, file, updateData, email);
  }

  @Patch(':id/privacy')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update file privacy' })
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
  async shareFileAccess(
    @Param('id') id: number,
    @Body('email') email: string,
    @Body('permission') permission: 'view' | 'edit',
    @Request() req,
  ) {
    return this.filesService.shareFileAccess(id, email, permission);
  }

  @Get('by-user')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get files accessible by user email' })
  async getFilesByUserEmail(@Request() req) {
    const email = req.user.email;
    return this.filesService.getFilesByUserEmail(email);
  }
}
