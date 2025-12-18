"use client";
import { relationAddressVisibilityTypes } from "@/utils/data/selectData";
import { Divider, Select, SelectItem } from "@nextui-org/react";
import { ChangeEvent, useEffect, useState } from "react";
import { editProfile, getProfileData } from "../Profile/actions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { UserType } from "@/types/userTypes";

const Privacy = ({
  username,
  userTypeLogged,
}: {
  username: string;
  userTypeLogged: string;
}) => {
  const [value, setValue] = useState<UserRelation | "none" | "all">("all");
  const [isLoading, setIsLoading] = useState(false);

  const submitAddressPrivacy = async (
    newValue: UserRelation | "none" | "all"
  ) => {
    setIsLoading(true);
    // Call API to update address privacy
    await editProfile({ addressPrivacy: newValue }, userTypeLogged as UserType);
    toastifySuccess("Cambios guardados");
    setIsLoading(false);
  };

  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    submitAddressPrivacy(e.target.value as UserRelation | "none" | "all");
    setValue(e.target.value as UserRelation | "none" | "all");
  };

  const getUserData = async () => {
    setIsLoading(true);
    const data = await getProfileData(username);
    if (data.error) {
      toastifyError(data.error);
      return;
    }
    setValue(data.addressPrivacy || "all");
    setIsLoading(false);
  };

  useEffect(() => {
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="flex flex-col gap-4 items-start w-full">
      <h2 className="profile-title">
        Privacidad y Visibilidad del Cartel de Usuario
      </h2>
      <Divider />
      {/* <div className="flex gap-4 w-full justify-between items-center">
        <div className="flex gap-2 items-start flex-col">
          <h6>Cartel de Usuario Privado</h6>
          <p className="text-xs">
            Cuando tu perfil es privado, solo las personas que sean tus
            contactos podrán ver tus anuncios, pizarra, revistas y grupos.
          </p>
        </div>
        <Switch aria-label="Cartel de Usuario privado" />
      </div> */}
      <div className="flex gap-4 w-full justify-between items-center">
        <div className="flex gap-2 items-start flex-col">
          <h6>Visibilidad de Dirección en Cartel de Usuario</h6>
          <p className="text-xs">
            Selecciona la visibilidad de quienes podrán ver tu dirección que
            agregaste en tu cartel de usuario.
          </p>
        </div>
        <Select
          scrollShadowProps={{
            hideScrollBar: false,
          }}
          classNames={{
            trigger:
              "shadow-none hover:shadow-sm border-[0.5px] group-data-[focus=true]:border-light-text py-1",
            value: `text-[0.8125rem]`,
            label: `font-medium text-[0.8125rem]`,
          }}
          radius="full"
          selectedKeys={[value]}
          isLoading={isLoading}
          isDisabled={isLoading}
          label="Tipo de Relación"
          placeholder="Seleccione un tipo de relación"
          variant="bordered"
          labelPlacement="outside"
          onChange={handleSelectionChange}
        >
          {relationAddressVisibilityTypes.map((item, index) => (
            <SelectItem
              key={item.value}
              value={item.value}
              variant="light"
              classNames={{
                title: "text-[0.8125rem]",
              }}
              aria-label={item.label}
              textValue={item.label}
            >
              {item.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </section>
  );
};

export default Privacy;
