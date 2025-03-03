import axios from "axios";
import { LoginResponseSchema, UserHandleResponseSchema, UserHandleSearchResponseSchema } from "../schema";
import api from "../config/axios";

export async function loginUser(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    const parsed = LoginResponseSchema.safeParse(response.data);
    if (!parsed.success) {
        throw new Error("Respuesta con formato invalido en el login");
    }

    const { token } = parsed.data.data;
    if (token){
        localStorage.setItem("AUTH_TOKEN", token);
        console.log(`Token almacenado: ${token}`);
    }
    return parsed.data;
}

export async function getUserByHandle(handle: string) {
  const response = await api.get(`/auth/handle/${handle}`);
  console.log(response.data)
  const parsed = UserHandleResponseSchema.safeParse(response.data);
  console.log(parsed.data)
  if (!parsed.success) {
    throw new Error('Respuesta con formato inválido al obtener usuario por handle');
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