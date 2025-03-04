import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Put,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder-dto';

@ApiTags('Folders')
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a folder' })
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.createFolder(
      createFolderDto.folderName,
      createFolderDto.parentFolderId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all root folders' })
  async getRootFolders(@Query('name') name?: string) {
    return this.foldersService.getRootFolders(name);
  }

  @Get(':parentId')
  @ApiOperation({
    summary: 'Get child folders of a parent',
  })
  @Get(':parentId')
  @ApiOperation({ summary: 'Get child folders of a parent' })
  async getChildFolders(
    @Param('parentId') parentId: string,
    @Query('name') name?: string,
  ) {
    if (parentId === 'all') {
      return this.foldersService.getChildFolders('all', name);
    }

    const parentIdInt = parseInt(parentId, 10);
    if (isNaN(parentIdInt)) {
      throw new BadRequestException('Invalid parent folder ID');
    }

    return this.foldersService.getChildFolders(parentIdInt, name);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all folders',
  })
  async getAllFolders(@Query('name') name?: string) {
    return this.foldersService.getAllFolders(name);
  }

  @Delete(':folderId')
  @ApiOperation({ summary: 'Delete a folder' })
  async deleteFolder(@Param('folderId') folderId: number) {
    return this.foldersService.deleteFolder(folderId);
  }

  @Put(':folderId')
  @ApiOperation({ summary: 'Edit folder name' })
  async updateFolder(
    @Param('folderId') folderId: number,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.updateFolder(folderId, updateFolderDto);
  }
}
