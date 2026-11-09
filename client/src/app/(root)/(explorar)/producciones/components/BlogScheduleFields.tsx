"use client";
import { Input } from "@nextui-org/react";
import { validateSchedule } from "../productionSchedule";

interface BlogScheduleFieldsProps {
  from: string;
  until: string;
  setFrom: (value: string) => void;
  setUntil: (value: string) => void;
  isDisabled?: boolean;
  showErrors?: boolean;
}

/**
 * Fechas de vigencia del blog: desde (obligatoria) y hasta (opcional). Fuera
 * del rango el blog no aparece en Explorar y quien entra por link ve un aviso;
 * no se borra nada y el staff lo sigue viendo.
 */
const BlogScheduleFields = ({
  from,
  until,
  setFrom,
  setUntil,
  isDisabled,
  showErrors,
}: BlogScheduleFieldsProps) => {
  const error = validateSchedule(from, until);
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium mb-1">Fechas de vigencia</legend>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          isRequired
          type="date"
          label="Vigente desde"
          labelPlacement="outside"
          placeholder=" "
          value={from}
          onValueChange={setFrom}
          isDisabled={isDisabled}
          isInvalid={showErrors && !from}
          errorMessage="La fecha de inicio es obligatoria"
        />
        <Input
          type="date"
          label="Vigente hasta (opcional)"
          labelPlacement="outside"
          placeholder=" "
          value={until}
          min={from || undefined}
          onValueChange={setUntil}
          isDisabled={isDisabled}
          isClearable
          onClear={() => setUntil("")}
          isInvalid={!!from && !!until && until < from}
          errorMessage="No puede ser anterior a la fecha de inicio"
        />
      </div>
      <small className="text-default-500">
        Fuera de estas fechas el blog no aparece en Explorar ni en tu cartel, y
        quien entre por link ve sólo un aviso. No se borra nada: vos lo seguís
        viendo y editando.
      </small>
      {showErrors && error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
};

export default BlogScheduleFields;
