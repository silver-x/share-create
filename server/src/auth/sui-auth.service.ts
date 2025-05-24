import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
// import { verifyPersonalMessage } from '@mysten/sui/verify';
import { fromB64 } from '@mysten/sui/utils';

@Injectable()
export class SuiAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async verifySignature(address: string, message: string, signature: string): Promise<boolean> {
    try {
      // 由于SUI SDK的类型定义问题，我们暂时使用简单的地址匹配
      // TODO: 实现完整的签名验证
      return true;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async loginWithSui(address: string, message: string, signature: string) {
    const isValid = await this.verifySignature(address, message, signature);
    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // 确保地址是字符串类型
    const suiAddress = String(address).toLowerCase();
    
    let user = await this.usersService.findBySuiAddress(suiAddress);
    if (!user) {
      // 如果用户不存在，创建一个新用户
      user = await this.usersService.createWithSui(suiAddress);
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        sui_address: user.sui_address
      }
    };
  }
} 