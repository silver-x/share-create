import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './entities/share.entity';
import { User } from '../users/entities/user.entity';
import { SuiService } from '../sui/sui.service';

@Injectable()
export class SharesService {
  constructor(
    @InjectRepository(Share)
    private sharesRepository: Repository<Share>,
    private suiService: SuiService,
  ) {}

  async create(createShareDto: any, userId: number) {
    try {
      // 1. 创建链上分享
      const chainResult = await this.suiService.createShareOnChain(
        createShareDto.content,
        createShareDto.title,
        userId,
      );

      // 2. 保存到数据库
      const share = this.sharesRepository.create({
        ...createShareDto,
        userId,
        chainTxId: chainResult.digest, // 保存交易ID
      });

      return await this.sharesRepository.save(share);
    } catch (error) {
      throw new Error(`Failed to create share: ${error.message}`);
    }
  }

  async findAll(options?: { userId?: number }): Promise<Share[]> {
    const queryBuilder = this.sharesRepository.createQueryBuilder('share')
      .leftJoinAndSelect('share.user', 'user')
      .orderBy('share.createdAt', 'DESC');

    if (options?.userId) {
      queryBuilder.where('user.id = :userId', { userId: options.userId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Share> {
    return this.sharesRepository.findOne({
      where: { id },
      relations: ['user', 'comments', 'likes'],
    });
  }

  async update(id: number, data: Partial<Share>): Promise<Share> {
    await this.sharesRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.sharesRepository.delete(id);
  }
} 