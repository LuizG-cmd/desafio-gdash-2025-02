import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface IUserResponse {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<IUserResponse | null> {
    const user = await this.userService.findOne(email);

    if (!user) throw new NotFoundException();

    const verifypassword = await bcrypt.compare(password, user.password);

    if (verifypassword) {
      return user as IUserResponse;
    } else {
      throw new UnauthorizedException();
    }
  }

  async login(user): Promise<{ accesstoken: string; refreshtoken: string }> {
    const payload = {
      sub: user.sub,
      email: user.email,
    };

    return {
      accesstoken: await this.jwtService.signAsync(payload),
      refreshtoken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
