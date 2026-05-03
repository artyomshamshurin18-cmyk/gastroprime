import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CrmTasksService } from './crm-tasks.service';

@UseGuards(AuthGuard('jwt'))
@Controller('crm/tasks')
export class CrmTasksController {
  constructor(private readonly tasksService: CrmTasksService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('dueBefore') dueBefore?: string,
    @Query('projectId') projectId?: string,
    @Query('boardStatus') boardStatus?: string,
    @Query('labels') labels?: string,
  ) {
    return this.tasksService.findAll(req.user, { status, type, dueBefore, projectId, boardStatus, labels });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  async create(@Request() req, @Body() data: {
    title: string;
    description?: string;
    dealId?: string;
    companyId?: string;
    type?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: string;
    projectId?: string;
    labels?: string[];
    parentTaskId?: string;
  }) {
    return this.tasksService.create(req.user, data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    projectId?: string | null;
    boardStatus?: string;
    labels?: string[];
    sortOrder?: number;
    userId?: string;
  }) {
    return this.tasksService.update(id, data);
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string) {
    return this.tasksService.complete(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  // ---- Comments ----

  @Get(':taskId/comments')
  async findComments(@Param('taskId') taskId: string) {
    return this.tasksService.findComments(taskId);
  }

  @Post(':taskId/comments')
  async createComment(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() data: { text: string; mentions?: string[] },
  ) {
    return this.tasksService.createComment(req.user, taskId, data);
  }

  // ---- Checklists ----

  @Get(':taskId/checklists')
  async findChecklists(@Param('taskId') taskId: string) {
    return this.tasksService.findChecklists(taskId);
  }

  @Post(':taskId/checklists')
  async createChecklist(
    @Param('taskId') taskId: string,
    @Body() data: { title: string },
  ) {
    return this.tasksService.createChecklist(taskId, data);
  }

  @Patch(':taskId/checklists/:id')
  async updateChecklist(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
    @Body() data: { title?: string; completed?: boolean },
  ) {
    return this.tasksService.updateChecklist(taskId, id, data);
  }

  @Delete(':taskId/checklists/:id')
  async deleteChecklist(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.deleteChecklist(taskId, id);
  }

  // ---- Checklist Items ----

  @Post(':taskId/checklists/:listId/items')
  async createChecklistItem(
    @Param('taskId') taskId: string,
    @Param('listId') listId: string,
    @Body() data: { text: string; assignedTo?: string },
  ) {
    return this.tasksService.createChecklistItem(taskId, listId, data);
  }

  @Patch(':taskId/checklists/:listId/items/:itemId')
  async updateChecklistItem(
    @Param('taskId') taskId: string,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() data: { text?: string; completed?: boolean; assignedTo?: string },
  ) {
    return this.tasksService.updateChecklistItem(taskId, listId, itemId, data);
  }

  @Delete(':taskId/checklists/:listId/items/:itemId')
  async deleteChecklistItem(
    @Param('taskId') taskId: string,
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.tasksService.deleteChecklistItem(taskId, listId, itemId);
  }

  // ---- Attachments ----

  @Get(':taskId/attachments')
  async findAttachments(@Param('taskId') taskId: string) {
    return this.tasksService.findAttachments(taskId);
  }

  @Post(':taskId/attachments')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'crm-files'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  async createAttachment(
    @Request() req,
    @Param('taskId') taskId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) throw new BadRequestException('Файл не загружен');
    return this.tasksService.createAttachment(req.user, taskId, file);
  }

  @Delete(':taskId/attachments/:id')
  async deleteAttachment(
    @Param('taskId') taskId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.deleteAttachment(taskId, id);
  }

  // ---- Subtasks ----

  @Get(':taskId/subtasks')
  async findSubTasks(@Param('taskId') taskId: string) {
    return this.tasksService.findSubTasks(taskId);
  }

  @Post(':taskId/subtasks')
  async createSubTask(
    @Request() req,
    @Param('taskId') taskId: string,
    @Body() data: { title: string },
  ) {
    return this.tasksService.createSubTask(req.user, taskId, data);
  }

  @Patch(':taskId/subtasks/:subId')
  async updateSubTask(
    @Param('taskId') taskId: string,
    @Param('subId') subId: string,
    @Body() data: { title?: string; completed?: boolean },
  ) {
    return this.tasksService.updateSubTask(taskId, subId, data);
  }

  @Delete(':taskId/subtasks/:subId')
  async deleteSubTask(
    @Param('taskId') taskId: string,
    @Param('subId') subId: string,
  ) {
    return this.tasksService.deleteSubTask(taskId, subId);
  }

  // ---- Labels ----

  @Post(':taskId/labels')
  async addLabel(
    @Param('taskId') taskId: string,
    @Body() data: { name: string; color: string },
  ) {
    return this.tasksService.addLabel(taskId, data);
  }

  @Delete(':taskId/labels/:labelId')
  async removeLabel(
    @Param('taskId') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.tasksService.removeLabel(taskId, labelId);
  }
}
