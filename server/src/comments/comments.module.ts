import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { SharesModule } from '../shares/shares.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), SharesModule],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [TypeOrmModule, CommentsService],
})
export class CommentsModule {} 