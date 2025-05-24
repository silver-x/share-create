import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() data: { title: string; content: string; image?: string }) {
    return this.sharesService.create(data, req.user.id);
  }

  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.sharesService.findAll(userId ? { userId: +userId } : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sharesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() data: { title?: string; content?: string; image?: string }) {
    return this.sharesService.update(+id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.sharesService.remove(+id);
  }
} 