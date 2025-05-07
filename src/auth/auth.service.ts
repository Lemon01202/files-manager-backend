import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/user.model';
import { GoogleUserDto } from './dto/google-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(googleUser: GoogleUserDto): Promise<User> {
    const { email, firstName, lastName, picture } = googleUser;

    let user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      user = await this.userModel.create({
        email,
        firstName,
        lastName,
        picture,
      });
    }

    return user;
  }

  createJwtToken(user: User) {
    const payload = { googleId: user.googleId, email: user.email };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });
  }
}
