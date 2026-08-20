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

export class RegisterDto extends createZodDto(registerSchema) { }
export class LoginDto extends createZodDto(loginSchema) { }

