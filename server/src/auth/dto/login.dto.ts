import { IsEmail, IsString, MinLength } from 'class-validator';


export class LoginDto {

  @IsEmail({}, { message: 'Incorect email' })
  email: string;

  @IsString({ message: 'Password must be string' })
  @MinLength(8, { message: 'Password to short' })
  password: string;
}
