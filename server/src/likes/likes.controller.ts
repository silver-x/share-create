import { Controller, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharesService } from '../shares/shares.service';

@Controller('likes')
export class LikesController {
  constructor(
    private readonly likesService: LikesService,
    private readonly sharesService: SharesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('share/:shareId')
  async create(@Request() req, @Param('shareId') shareId: string) {
    const share = await this.sharesService.findOne(+shareId);
    return this.likesService.create(req.user, share);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('share/:shareId')
  async remove(@Request() req, @Param('shareId') shareId: string) {
    return this.likesService.remove(req.user.id, +shareId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('share/:shareId/check')
  async hasLiked(@Request() req, @Param('shareId') shareId: string) {
    return this.likesService.hasLiked(req.user.id, +shareId);
  }
} 