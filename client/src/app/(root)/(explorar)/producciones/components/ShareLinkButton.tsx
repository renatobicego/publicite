"use client";
import { Button } from "@nextui-org/react";
import { FaShareAlt } from "react-icons/fa";
import { shareLink } from "@/utils/functions/utils";
import { absoluteUrl } from "../productionShare";

/**
 * Comparte el link de un contenido del blog (menú de compartir del sistema o,
 * si no hay, copia al portapapeles).
 */
const ShareLinkButton = ({
  path,
  title,
  label = "Compartir",
  iconOnly = false,
}: {
  /** Ruta relativa: ver `productionShare.ts`. */
  path: string;
  title: string;
  label?: string;
  iconOnly?: boolean;
}) => (
  <Button
    size="sm"
    variant="light"
    radius="full"
    isIconOnly={iconOnly}
    aria-label={label}
    title={label}
    startContent={iconOnly ? undefined : <FaShareAlt />}
    onPress={() => shareLink(absoluteUrl(path), title)}
  >
    {iconOnly ? <FaShareAlt /> : label}
  </Button>
);

export default ShareLinkButton;
