import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet } from "react-router-dom";
import DevTree from "../components/DevTree";
import { getUserQuery } from "../api/auth";
import { decodeJWT } from "../utils";


export default function AppLayout() {
  const token = localStorage.getItem("AUTH_TOKEN");
  let userId: string | null = null;

  if (token) {
    const decoded = decodeJWT<{ id: string }>(token);
    userId = decoded?.id;
  }

  if (!userId) return <Navigate to={"/auth/login"} />;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: getUserQuery,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  console.log("isLoading:", isLoading);
  console.log("isError:", isError);
  console.log("data:", data);
  if (isError) console.error("Error:", error);

  if(isLoading) return 'Cargando...'
  if(isError) return <Navigate to={'/auth/login'} />
  if(data) return <DevTree data={data.data} />

  return <Outlet />;
}