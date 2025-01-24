import { z } from 'zod';

export const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const registerUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long")
        .max(64, "Password must not exceed 64 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

export type LoginFormData = z.infer<typeof loginUserSchema>;
export type RegisterFormData = z.infer<typeof registerUserSchema>; 