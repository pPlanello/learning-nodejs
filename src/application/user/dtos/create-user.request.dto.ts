import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator'

export class CreateUserRequestDTO {
  @IsNotEmpty()
  @Length(1, 255)
  name!: string

  @IsEmail()
  @Length(5, 254)
  email!: string

  @IsNotEmpty()
  @Length(8, 255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/)
  password!: string
}
