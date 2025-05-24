import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Share } from '../shares/entities/share.entity';
import { CommentWithSafeUser } from './types/comment.types';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(user: User, share: Share, content: string): Promise<Comment> {
    const comment = this.commentsRepository.create({
      content,
      user,
      share,
    });
    return this.commentsRepository.save(comment);
  }

  async findByShare(shareId: number): Promise<CommentWithSafeUser[]> {
    const comments = await this.commentsRepository.find({
      where: { share: { id: shareId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // 过滤掉用户信息中的密码字段
    return comments.map(comment => {
      const { password, ...userWithoutPassword } = comment.user;
      return {
        ...comment,
        user: userWithoutPassword
      };
    });
  }

  async remove(id: number): Promise<void> {
    await this.commentsRepository.delete(id);
  }
} 