import { Divider, Switch } from "@nextui-org/react";

const Privacy = () => {
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">Privacidad y Visibilidad del Perfil</h2>
      <Divider />
      <div className="flex gap-4 w-full justify-between items-center">
        <div className="flex gap-2 items-start flex-col">
          <h6>Perfil Privado</h6>
          <p className="text-xs">
            Cuando tu perfil es privado, solo las personas que sean tus
            contactos podrán ver tus anuncios, pizarra, revistas y grupos.
          </p>
        </div>
        <Switch aria-label="Perfil privado" />
      </div>
    </section>
  );
};

export default Privacy;
