import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import DevTree from "../components/DevTree";
import { getUserQuery } from "../api/auth";
import { decodeJWT } from "../utils";


export default function AppLayout() {
  // Obtén el token del localStorage
  const token = localStorage.getItem("AUTH_TOKEN");
  let userId: string | null = null;

  if (token) {
    const decoded = decodeJWT<{ id: string }>(token);
    userId = decoded?.id;
  }

  // Si no existe userId, se redirige a login
  if (!userId) return <Navigate to={"/auth/login"} />;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", userId],
    queryFn: getUserQuery,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <>Cargando...</>;
  if (isError) return <Navigate to={"/auth/login"} />;
  if (data) return <DevTree data={data.data} />;

}