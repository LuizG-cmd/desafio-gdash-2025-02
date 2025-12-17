import { IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Min(1)
  @Max(50)
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
