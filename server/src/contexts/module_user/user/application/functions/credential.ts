import { BadRequestException } from '@nestjs/common';

/** Key de UploadThing: letras, números, guiones y guiones bajos. */
const UPLOAD_KEY_REGEX = /^[A-Za-z0-9_-]{1,128}$/;
/** Color decorativo de la credencial: hex de 6 dígitos (`#rrggbb`). */
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export interface CredentialInput {
  credentialPhotoUrl?: string | null;
  credentialColor?: string | null;
}

/**
 * Normaliza y valida la credencial que manda el cliente. Un valor vacío o
 * nulo significa "quitar" (vuelve a la foto de perfil / al color por defecto).
 */
export function normalizeCredential(input: CredentialInput): {
  credentialPhotoUrl: string | null;
  credentialColor: string | null;
} {
  const photo = input.credentialPhotoUrl?.trim() || null;
  const color = input.credentialColor?.trim() || null;

  if (photo && !UPLOAD_KEY_REGEX.test(photo)) {
    throw new BadRequestException('La foto de la credencial no es válida.');
  }
  if (color && !HEX_COLOR_REGEX.test(color)) {
    throw new BadRequestException(
      'El color de la credencial debe tener el formato #rrggbb.',
    );
  }
  return {
    credentialPhotoUrl: photo,
    credentialColor: color ? color.toLowerCase() : null,
  };
}
