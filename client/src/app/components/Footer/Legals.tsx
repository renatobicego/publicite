import { Link } from "@nextui-org/react";

const Legals = () => {
  return (
    <ul className="flex flex-col gap-1">
      <li className="text-white font-bold">Navegación</li>
      <li>
        <Link size="sm" className="text-white" href={""}>
          Sobre Nosotros
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={""}>
          Políticas de Privacidad
        </Link>
      </li>
      <li>
        <Link size="sm" className="text-white" href={""}>
          Políticas de Cookies
        </Link>
      </li>
    </ul>
  );
};

export default Legals;
