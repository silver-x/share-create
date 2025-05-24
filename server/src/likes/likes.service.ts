import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Share } from '../shares/entities/share.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
  ) {}

  async create(user: User, share: Share): Promise<Like> {
    const like = this.likesRepository.create({
      user,
      share,
    });
    return this.likesRepository.save(like);
  }

  async findByShare(shareId: number): Promise<Like[]> {
    return this.likesRepository.find({
      where: { share: { id: shareId } },
      relations: ['user'],
    });
  }

  async remove(userId: number, shareId: number): Promise<void> {
    await this.likesRepository.delete({
      user: { id: userId },
      share: { id: shareId },
    });
  }

  async hasLiked(userId: number, shareId: number): Promise<boolean> {
    const like = await this.likesRepository.findOne({
      where: {
        user: { id: userId },
        share: { id: shareId },
      },
    });
    return !!like;
  }
} 