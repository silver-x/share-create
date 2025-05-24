import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Share } from './entities/share.entity';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { SuiModule } from '../sui/sui.module';

@Module({
  imports: [TypeOrmModule.forFeature([Share]), SuiModule],
  providers: [SharesService],
  controllers: [SharesController],
  exports: [TypeOrmModule, SharesService],
})
export class SharesModule {} 