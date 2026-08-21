"use client";

import { Input, Textarea } from "@nextui-org/react";

import {
  AVATAR_CONTEXT_MAX_LENGTH,
  AVATAR_NAME_MAX_LENGTH,
} from "@/types/avatarTypes";
import AvatarImage from "./AvatarImage";

interface AvatarFormProps {
  name: string;
  context: string;
  onNameChange: (name: string) => void;
  onContextChange: (context: string) => void;
  /** Seed de la preview: el _id al editar, el nombre tipeado al crear. */
  previewSeed: string;
  isDisabled?: boolean;
}

/** Campos compartidos por los modales de crear y editar avatar. */
export default function AvatarForm({
  name,
  context,
  onNameChange,
  onContextChange,
  previewSeed,
  isDisabled,
}: AvatarFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <AvatarImage seed={previewSeed || "cubito"} size={64} />
        <p className="text-xs text-default-500">
          La imagen se genera sola a partir del avatar: es única y no cambia.
        </p>
      </div>

      <Input
        variant="bordered"
        label="Nombre"
        labelPlacement="outside"
        placeholder="Ej: Diseñador UX"
        value={name}
        onValueChange={onNameChange}
        maxLength={AVATAR_NAME_MAX_LENGTH}
        description={`${name.length}/${AVATAR_NAME_MAX_LENGTH}`}
        isDisabled={isDisabled}
        isRequired
      />

      <Textarea
        variant="bordered"
        label="Contexto / Instrucciones"
        labelPlacement="outside"
        placeholder={
          'Ej: "Sos un experto en diseño gráfico. Respondé enfocado en composición, paletas y tipografías."'
        }
        value={context}
        onValueChange={onContextChange}
        maxLength={AVATAR_CONTEXT_MAX_LENGTH}
        description={`${context.length}/${AVATAR_CONTEXT_MAX_LENGTH}`}
        minRows={5}
        isDisabled={isDisabled}
        isRequired
      />
    </div>
  );
}
