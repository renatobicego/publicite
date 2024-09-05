import { Link } from "@nextui-org/react";
import React from "react";

const Support = () => {
  return (
    <ul className="flex flex-col gap-1">
      <li className="text-white font-bold">Soporte</li>
      <li>
        <Link size="sm" className="text-white" href={""}>
          Tutoriales
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={""}>
          Contactar Soporte
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={""}>
          Sobre Nosotros
        </Link>
      </li>
    </ul>
  );
};

export default Support;
