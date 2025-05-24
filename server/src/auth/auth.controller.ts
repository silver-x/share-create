import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SuiAuthService } from './sui-auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private suiAuthService: SuiAuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const loginResult = await this.authService.login(req.user);
    const { password, ...userWithoutPassword } = req.user;
    return {
      data: {
        token: loginResult.access_token,
        user: userWithoutPassword
      }
    };
  }

  @Post('sui-login')
  async suiLogin(@Body() body: { address: string; message: string; signature: string }) {
    const result = await this.suiAuthService.loginWithSui(
      body.address,
      body.message,
      body.signature
    );
    return {
      data: {
        token: result.access_token,
        user: result.user
      }
    };
  }
} 