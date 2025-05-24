import { Controller, Get, Post, Body, Param, UseGuards, Request, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    try {
      const user = await this.usersService.create(body.username, body.password);
      // 注册成功后生成 token
      const { password, ...result } = user;
      const loginResult = await this.authService.login(result);
      return {
        data: {
          token: loginResult.access_token,
          user: result
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async updateProfile(@Request() req, @Body() data: { avatar?: string; bio?: string }) {
    const updatedUser = await this.usersService.updateProfile(req.user.id, data);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
} 