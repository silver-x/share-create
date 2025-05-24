import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharesService } from '../shares/shares.service';
import { CommentWithSafeUser } from './types/comment.types';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly sharesService: SharesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('share/:shareId')
  async create(
    @Request() req,
    @Param('shareId') shareId: string,
    @Body() data: { content: string },
  ) {
    const share = await this.sharesService.findOne(+shareId);
    return this.commentsService.create(req.user, share, data.content);
  }

  @Get('share/:shareId')
  async findByShare(@Param('shareId') shareId: string): Promise<CommentWithSafeUser[]> {
    return this.commentsService.findByShare(+shareId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }
} 