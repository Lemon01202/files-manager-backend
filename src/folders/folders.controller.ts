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
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Folders')
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a folder' })
  @ApiBody({ type: CreateFolderDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 201, description: 'Folder successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.foldersService.createFolder(
      createFolderDto.folderName,
      createFolderDto.parentFolderId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all root folders' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by folder name',
  })
  @ApiResponse({ status: 200, description: 'List of root folders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRootFolders(@Query('name') name?: string) {
    return this.foldersService.getRootFolders(name);
  }

  @Get(':parentId')
  @ApiOperation({ summary: 'Get child folders of a parent' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by folder name',
  })
  @ApiResponse({ status: 200, description: 'List of child folders' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ summary: 'Get all folders' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by folder name',
  })
  @ApiResponse({ status: 200, description: 'List of all folders' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllFolders(@Query('name') name?: string) {
    return this.foldersService.getAllFolders(name);
  }

  @Delete(':folderId')
  @ApiOperation({ summary: 'Delete a folder' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'Folder successfully deleted' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteFolder(@Param('folderId') folderId: number, @Request() req) {
    return this.foldersService.deleteFolder(folderId);
  }

  @Put(':folderId')
  @ApiOperation({ summary: 'Edit folder name' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiBody({ type: UpdateFolderDto })
  @ApiResponse({ status: 200, description: 'Folder name successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateFolder(
    @Param('folderId') folderId: number,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.updateFolder(folderId, updateFolderDto);
  }
}
