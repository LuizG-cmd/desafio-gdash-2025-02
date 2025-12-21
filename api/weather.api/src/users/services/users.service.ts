import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserResponseDto } from '../dto/user-response.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import type { SoftDeleteModel } from 'mongoose-delete';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly saltOrRounds: number;

  constructor(
    @InjectModel(User.name)
    private readonly userModel: SoftDeleteModel<User>,
    private readonly configService: ConfigService,
  ) {
    const salt = this.configService.get<number>('BCRYPT_SALTS');

    if (!salt) {
      throw new NotFoundException('Define your salts for hashing password');
    }

    this.saltOrRounds = Number(salt);
  }
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existinguser = await this.findOne(createUserDto.email);

    if (existinguser) throw new ConflictException('User arleady active');
    const hashpassword = await bcrypt.hash(
      createUserDto.password,
      this.saltOrRounds,
    );
    const user = await new this.userModel({
      ...createUserDto,
      password: hashpassword,
    }).save();

    return {
      id: user._id,
      email: user.email,
    };
  }

  async findAll() {
    return await this.userModel.find().exec();
  }

  async findOne(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true },
    );

    if (!user)
      throw new NotFoundException('User not found, please type other ID');

    return {
      id: user._id,
      email: user.email,
    };
  }

  async softDelete(id: string): Promise<string> {
    const result = await this.userModel.deleteById(id);
    if (!result || result.deletedCount === 0) {
      throw new NotFoundException(`Record with ID ${id} not found.`);
    }
    return 'Record Deleted Successfully';
  }
}
