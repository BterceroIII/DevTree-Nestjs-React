import axios from "axios";
import { LoginResponseSchema, RegisterResponseSchema, User, UserHandleResponseSchema, UserHandleSearchResponseSchema, UserIdResponseSchema } from "../schema";
import api from "../config/axios";
import { QueryFunctionContext } from "@tanstack/react-query";

export async function registerUser(name: string, email: string, password: string, handle: string) {
  const response = await api.post('/auth/register', { name, email, password, handle });
  const parsed = RegisterResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error("Respuesta con formato inválido al registrar usuario");
  }
  return parsed.data;
}

export async function loginUser(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const parsed = LoginResponseSchema.safeParse(response.data);
    if (!parsed.success) {
        throw new Error("Respuesta con formato invalido en el login");
    }

    const { token } = parsed.data.data;
    if (token){
        localStorage.setItem("AUTH_TOKEN", token);
    }
    return parsed.data;
}

export async function getUserByHandle(handle: string) {
  const response = await api.get(`/auth/handle/${handle}`);
  const parsed = UserHandleResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error('Respuesta con formato inválido al obtener usuario por handle');
  }
  return parsed.data;
}

export async function getUser(id: string) {
  const response = await api.get(`/auth/${id}`);
  const parsed = UserIdResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error('Respuesta con formato inválido al obtener usuario');
  }
  return parsed.data;
}

export async function getUserQuery(
  context: QueryFunctionContext<[string, string]>
) {
  const [_key, id] = context.queryKey;
  return getUser(id);
}

export async function updateProfile(id: string,formData: User) {
  const response = await api.put(`/auth/${id}`, formData);
  const parsed = UserHandleResponseSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new Error('Respuesta con formato inválido al actualizar usuario');
  }
  return parsed.data;
}

export async function searchByHandle(handle: string) {
  try {
    const response = await api.get(`/auth/search/${handle}`);
    const parsed = UserHandleSearchResponseSchema.safeParse(response.data);
    if (!parsed.success) {
      throw new Error("Respuesta con formato inválido al buscar usuario por handle");
    }
    return parsed.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      const message =
        (error.response.data as { message?: string }).message ||
        "Error inesperado";
      throw new Error(message);
    }
    throw new Error("Error en la petición");
  }
}