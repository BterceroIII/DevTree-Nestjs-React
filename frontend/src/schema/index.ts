import { z, ZodTypeAny } from "zod";

export const ApiResponseSchema = <T extends ZodTypeAny>(dataSchema: T) => {
  return z.object({
    data: dataSchema,
    message: z.string(),
    succeeded: z.boolean(),
    title: z.string(),
  });
};

export const UserSchema = z.object({
  handle: z.string(),
  name: z.string(),
  email: z.string().email(),
  id: z.string(),
  description: z.string(),
  image: z.string(),
  links: z.string().array(),
});

export type User = z.infer<typeof UserSchema>;


export const UserHandleSchema = UserSchema.pick({
  description: true,
  handle: true,
  id: true,
  image: true,
  links: true,
  name: true,
});

export const UserHandleSearchResponseSchema = z.object({
  succeeded: z.boolean(),
  message: z.string(),
  title: z.string(),
});

export const RegisterFormSchema = UserSchema.pick({
  handle: true,
  email: true,
  name: true,
}).extend({
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  password_confirmation: z.string(),
}).refine(
  (data) => data.password === data.password_confirmation,
  { message: "Las contraseñas no coinciden", path: ["password_confirmation"] }
);

export const LoginFormSchema = UserSchema.pick({
  email: true,
}).extend({
  password: z.string(),
});

// Define el esquema para SocialNetwork
export const SocialNetworkSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  enabled: z.boolean(),
});

// Crea el esquema para DevTreeLink usando .pick()
export const DevTreeLinkSchema = SocialNetworkSchema.pick({
  name: true,
  url: true,
  enabled: true,
});


export const LoginTokenSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

export const LoginResponseSchema = ApiResponseSchema(LoginTokenSchema);
export const UserHandleResponseSchema = ApiResponseSchema(UserHandleSchema);

export type RegisterForm = z.infer<typeof RegisterFormSchema>;
export type DevTreeLink = z.infer<typeof DevTreeLinkSchema>;
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type UserHandle = z.infer<typeof UserHandleSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type UserHandleResponse = z.infer<typeof UserHandleResponseSchema>;
export type UserHandleSearch = z.infer<typeof UserHandleSearchResponseSchema>;