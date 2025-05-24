import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';

export interface CommentWithSafeUser extends Omit<Comment, 'user'> {
  user: Omit<User, 'password'>;
} 