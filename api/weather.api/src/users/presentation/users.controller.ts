import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('api/users/user')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/users/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/users')
  findall() {
    return this.usersService.findAll();
  }

  @Patch('api/users/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete('api/users/:id')
  remove(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}
