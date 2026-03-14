import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  emailVerifyToken?: string;

  @IsDate()
  @IsOptional()
  emailVerifyTokenExp?: Date;

  @IsDate()
  @IsOptional()
  emailVerifiedAt?: Date;
}
