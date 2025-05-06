import { useEffect, useState } from "react";
import { social } from "../data/social";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SocialNetwork, User } from "../schema";
import { toast } from "sonner";
import { updateProfile } from "../api/auth";
import DevTreeInput from "../components/DevTreeInput";
import { decodeJWT } from "../utils";

// Función para parsear `links` ya sea que venga como string o arreglo
function parseLinks(links: any): SocialNetwork[] {
  if (typeof links === "string") {
    try {
      return JSON.parse(links);
    } catch (error) {
      console.error("Error al parsear links:", error);
      return [];
    }
  } else if (Array.isArray(links)) {
    return links;
  }
  return [];
}

export default function LinkTreeView() {
  const [devTreeLinks, setDevTreeLinks] = useState(social);
  const queryClient = useQueryClient();

  // Obtener el userId del token
  const token = localStorage.getItem("AUTH_TOKEN");
  let userId: string | null = null;
  if (token) {
    const decoded = decodeJWT<{ id: string }>(token);
    userId = decoded?.id;
  }

  // Usamos la misma clave que en AppLayout
  const queryKey = userId ? ["user", userId] : ["user"];
  const queryData = queryClient.getQueryData(queryKey);
  const user: User | undefined =
    queryData && (queryData as any).data
      ? (queryData as any).data
      : undefined;

  if (!user) {
    console.log("User:", user);
    return <div>Cargando...</div>;
  }

  const { mutate } = useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: string;
      formData: { links: string };
    }) => updateProfile(id, formData),
    onError: (error: any) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Actualizado Correctamente");
    },
  });

  useEffect(() => {
    const parsedLinks = parseLinks(user.links);
    const updateData = devTreeLinks.map((item) => {
      const userLink = parsedLinks.find(
        (link: SocialNetwork) => link.name === item.name
      );
      if (userLink) {
        return { ...item, url: userLink.url, enabled: userLink.enabled };
      }
      return item;
    });
    setDevTreeLinks(updateData);
  }, [user.links]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLinks = devTreeLinks.map((link) =>
      link.name === e.target.name
        ? { ...link, url: e.target.value }
        : link
    );
    setDevTreeLinks(updatedLinks);
  };

  // Usamos parseLinks para obtener los links de forma segura
  const links: SocialNetwork[] = parseLinks(user.links);

  const handleEnabledLink = (socialNetwork: string) => {
    const updateLinks = devTreeLinks.map((link) => {
      if (link.name === socialNetwork) {
        return { ...link, enabled: !link.enabled };
      }
      return link;
    });
    setDevTreeLinks(updateLinks);

    let updatedItems: SocialNetwork[] = [];
    const selectedSocialNetwork = updateLinks.find(
      (link) => link.name === socialNetwork
    );
    if (selectedSocialNetwork?.enabled) {
      const id = links.filter((link) => link.id).length + 1;
      if (links.some((link) => link.name === socialNetwork)) {
        updatedItems = links.map((link) => {
          if (link.name === socialNetwork) {
            return { ...link, enabled: true, id };
          }
          return link;
        });
      } else {
        const newItem = { ...selectedSocialNetwork, id };
        updatedItems = [...links, newItem];
      }
    } else {
      const indexToUpdate = links.findIndex(
        (link) => link.name === socialNetwork
      );
      updatedItems = links.map((link) => {
        if (link.name === socialNetwork) {
          return { ...link, id: 0, enabled: false };
        } else if (
          link.id > indexToUpdate &&
          indexToUpdate !== 0 &&
          link.id === 1
        ) {
          return { ...link, id: link.id - 1 };
        }
        return link;
      });
    }

    // Actualiza en el query cache: se guarda "links" como string
    queryClient.setQueryData(queryKey, (prev: any) => {
      return {
        ...prev,
        data: { ...prev.data, links: JSON.stringify(updatedItems) },
      };
    });
  };

  return (
    <div className="space-y-5">
      {devTreeLinks.map((item) => (
        <DevTreeInput
          key={item.name}
          item={item}
          handleUrlChange={handleUrlChange}
          handleEnableLink={handleEnabledLink}
        />
      ))}
      <button
        className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold"
        onClick={() => {
          const updatedUser = queryClient.getQueryData(queryKey) as {
            data: User;
          };
          if (updatedUser && updatedUser.data.id) {
            // Enviamos únicamente el campo "links"
            mutate({
              id: updatedUser.data.id,
              formData: { links: updatedUser.data.links || "" },
            });
          } else {
            toast.error("ID del usuario indefinido");
          }
        }}
      >
        Guardar Cambios
      </button>
    </div>
  );
}
