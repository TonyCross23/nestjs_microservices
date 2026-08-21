import z from "zod";
import { createZodDto } from 'nestjs-zod';

export const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "email is required").email("Invalid email"),
    password: z.string().min(1, "password is required")
})

export const loginSchema = z.object({
    email: z.string().min(1, "email is required").email("Invalid email"),
    password: z.string().min(1, "password is required")
})

export const createSellerSchema = registerSchema;

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
});

export class RegisterDto extends createZodDto(registerSchema) { }
export class LoginDto extends createZodDto(loginSchema) { }
export class CreateSellerDto extends createZodDto(createSellerSchema) { }
export class RefreshTokenDto extends createZodDto(refreshTokenSchema) { }
