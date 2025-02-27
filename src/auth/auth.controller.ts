import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleUserDto } from './dto/google-user.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Authorization using Google' })
  @ApiResponse({ status: 302, description: 'Redirect on Google OAuth' })
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @ApiOperation({ summary: 'Callback after Google OAuth' })
  @ApiResponse({
    status: 200,
    description: 'User information',
    type: GoogleUserDto,
  })
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const token = this.authService.createJwtToken(req.user);
    const email = req.user.email;

    res.cookie('token', token, { httpOnly: true, secure: true });

    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${token}&email=${encodeURIComponent(email)}`,
    );
  }
}
