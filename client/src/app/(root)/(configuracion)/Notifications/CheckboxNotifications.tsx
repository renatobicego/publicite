import { Checkbox, CheckboxGroup } from "@nextui-org/react";
import { useState } from "react";

const CheckboxNotifications = () => {
  const [selected, setSelected] = useState([
    "mis-anuncios",
    "anuncio-compartido",
    "calificar-anuncio",
    "grupos",
    "revistas",
    "contactos",
  ]);

  return (
    <div className="flex flex-col gap-3">
      <CheckboxGroup
        label="¿Qué notificaciones desea recibir?"
        color="primary"
        size="sm"
        classNames={{
          label: "text-sm text-text-color",
        }}
        value={selected}
        onValueChange={setSelected}
      >
        <Checkbox value="mis-anuncios">Mis anuncios</Checkbox>
        <Checkbox value="anuncio-compartido">Anuncio compartidos</Checkbox>
        <Checkbox value="calificar-anuncio">
          Invitaciones a calificar anuncios
        </Checkbox>
        <Checkbox value="grupos">Grupos</Checkbox>
        <Checkbox value="revistas">Revistas</Checkbox>
        <Checkbox value="contactos">Contactos</Checkbox>
      </CheckboxGroup>
    </div>
  );
};

export default CheckboxNotifications;
