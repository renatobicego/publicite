"use client"
import { GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import { useUser } from "@clerk/nextjs";
import { Link } from "@nextui-org/react";
import React from "react";

const Navigation = () => {
    const {user} = useUser()
  return (
    <ul className="flex flex-col gap-1">
      <li className="text-white font-bold">Navegación</li>
      <li>
        <Link size="sm" className="text-white" href={"/"}>
          Inicio
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={`${PROFILE}/${user?.username}`}>
          Mi Perfil
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={`${PROFILE}/${user?.username}/${MAGAZINES}}`}>
          Mis Revistas
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={`${PROFILE}/${user?.username}/${GROUPS}}`}>
          Mis Grupos
        </Link>
      </li>
    </ul>
  );
};

export default Navigation;
