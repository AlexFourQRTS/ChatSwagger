import { IsEmail, IsString, MinLength } from 'class-validator';





export class RegisterDto {

    @IsEmail({}, { message: 'Incorect email' })
    email: string;

    @MinLength(1, { message: 'To short' })
    password: string;

    @MinLength(1, { message: 'To short' })
    confirmPassword: string;

}
