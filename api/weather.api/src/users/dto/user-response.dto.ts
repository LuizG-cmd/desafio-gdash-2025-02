import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UserResponseDto {
  @IsString()
  @IsOptional()
  email: string;

  @IsMongoId()
  id: object;
}
