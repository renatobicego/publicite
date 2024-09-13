"use client";
import { useState } from "react";
import SelectType from "../SelectType";
import UploadImages from "../Upload/UploadImages";
import { Divider } from "@nextui-org/react";
import CreateGood from "../CreateGood/CreateGood";
import CreateService from "../CreateService/CreateService";

const CreateForm = () => {
  const [type, setType] = useState<"good" | "service">();
  const [files, setFiles] = useState<File[]>([]);

  return (
    <section className="w-full flex gap-4 items-start max-md:flex-col">
      <UploadImages files={files} setFiles={setFiles} type={type} />
      <div className="flex flex-col flex-1 gap-4 max-md:w-full">
        <SelectType type={type} setType={setType} />
        <Divider />
        {!type && (
          <p className="text-red-500 text-center max-lg:text-sm">
            Por favor, seleccione si es un bien o un servicio.
          </p>
        )}
        {type === "good" ? (
          <CreateGood files={files} />
        ) : (
          type === "service" && <CreateService files={files} />
        )}
      </div>
    </section>
  );
};

export default CreateForm;
