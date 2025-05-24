import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { SharesModule } from '../shares/shares.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like]), SharesModule],
  providers: [LikesService],
  controllers: [LikesController],
  exports: [TypeOrmModule, LikesService],
})
export class LikesModule {} 