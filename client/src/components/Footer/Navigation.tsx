"use client";
import { GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import { Link } from "@nextui-org/react";
import React from "react";

const Navigation = ({ username }: { username?: string | null }) => {
  return (
    <ul className="flex flex-col gap-1">
      <li className="text-white font-bold">Navegación</li>
      <li>
        <Link size="sm" className="text-white" href={"/"}>
          Inicio
        </Link>
      </li>
      {username ? (
        <>
          <li>
            <Link
              size="sm"
              className="text-white"
              href={`${PROFILE}/${username}`}
            >
              Mi Perfil
            </Link>
          </li>
          <li>
            <Link
              size="sm"
              className="text-white"
              href={`${PROFILE}/${username}/${MAGAZINES}}`}
            >
              Mis Revistas
            </Link>
          </li>
          <li>
            <Link
              size="sm"
              className="text-white"
              href={`${PROFILE}/${username}/${GROUPS}}`}
            >
              Mis Grupos
            </Link>
          </li>
        </>
      ) : (
        <>
          <li>
            <Link size="sm" className="text-white" href={`/iniciar-sesion`}>
              Iniciar Sesión
            </Link>
          </li>
          <li>
            <Link size="sm" className="text-white" href={`/registrarse`}>
              Registarse
            </Link>
          </li>
        </>
      )}
    </ul>
  );
};

export default Navigation;
