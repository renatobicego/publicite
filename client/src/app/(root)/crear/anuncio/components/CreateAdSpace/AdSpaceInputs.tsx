"use client";
import { useState } from "react";
import { Field, useFormikContext } from "formik";
import { Button, Checkbox, CheckboxGroup, Chip } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";
import { CustomInput, CustomSelect } from "@/components/inputs/CustomInputs";
import { AdSpaceMedium, AdSpacePostValues } from "@/types/postTypes";
import {
  AD_SPACE_COVERAGE,
  AD_SPACE_EDITIONS,
  AD_SPACE_FIELD_LABEL,
  AD_SPACE_FIELD_PLACEHOLDER,
  AD_SPACE_FORMAT_SUGGESTIONS,
  AD_SPACE_MEDIUMS,
  AD_SPACE_NETWORK_OPTIONS,
  AdSpaceField,
  adSpaceMediumOf,
} from "@/utils/data/adSpaces";

const MAX_FORMATS = 10;

/**
 * Datos propios del espacio publicitario: medio, nombre, alcance (dirección,
 * link o área según el medio), datos del medio, audiencia y formatos.
 */
const AdSpaceInputs = ({ canChangeMedium = true }: { canChangeMedium?: boolean }) => {
  const { values, setFieldValue, errors } =
    useFormikContext<AdSpacePostValues>();
  const adSpace = values.adSpace;
  const info = adSpaceMediumOf(adSpace?.medium);
  const [formatDraft, setFormatDraft] = useState("");
  const formats = adSpace?.formats ?? [];

  const addFormat = (value: string) => {
    const v = value.trim();
    if (!v || formats.length >= MAX_FORMATS) return;
    if (formats.some((f) => f.toLowerCase() === v.toLowerCase())) return;
    setFieldValue("adSpace.formats", [...formats, v]);
    setFormatDraft("");
  };

  const textField = (field: AdSpaceField, required = false) => (
    <Field
      key={field}
      as={CustomInput}
      name={`adSpace.${field}`}
      label={AD_SPACE_FIELD_LABEL[field]}
      placeholder={AD_SPACE_FIELD_PLACEHOLDER[field] ?? ""}
      aria-label={AD_SPACE_FIELD_LABEL[field]}
      isRequired={required}
      value={(adSpace as any)?.[field] ?? ""}
    />
  );

  const mediumField = (field: AdSpaceField) => {
    const required = !!info?.required.includes(field);
    switch (field) {
      case "band":
        return (
          <Field
            key={field}
            as={CustomSelect}
            items={[
              { value: "FM", label: "FM" },
              { value: "AM", label: "AM" },
            ]}
            getItemValue={(i: any) => i.value}
            getItemLabel={(i: any) => i.label}
            getItemTextValue={(i: any) => i.label}
            name="adSpace.band"
            label="Banda"
            placeholder="AM o FM"
            aria-label="banda"
            isRequired={required}
          />
        );
      case "edition":
        return (
          <Field
            key={field}
            as={CustomSelect}
            items={AD_SPACE_EDITIONS}
            getItemValue={(i: any) => i.value}
            getItemLabel={(i: any) => i.label}
            getItemTextValue={(i: any) => i.label}
            name="adSpace.edition"
            label="Edición"
            placeholder="Papel, digital o ambas"
            aria-label="edición"
            isRequired={required}
          />
        );
      case "illuminated":
        return (
          <Checkbox
            key={field}
            size="sm"
            isSelected={!!adSpace?.illuminated}
            onValueChange={(v) => setFieldValue("adSpace.illuminated", v)}
          >
            Iluminado de noche
          </Checkbox>
        );
      case "networks":
        return (
          <CheckboxGroup
            key={field}
            label="Redes donde publica"
            orientation="horizontal"
            size="sm"
            isRequired={required}
            value={adSpace?.networks ?? []}
            onValueChange={(v) => setFieldValue("adSpace.networks", v)}
            classNames={{ label: "font-medium text-[0.8125rem]" }}
          >
            {AD_SPACE_NETWORK_OPTIONS.map((network) => (
              <Checkbox key={network} value={network}>
                {network}
              </Checkbox>
            ))}
          </CheckboxGroup>
        );
      case "followers":
        return (
          <Field
            key={field}
            as={CustomInput}
            type="number"
            min={0}
            name="adSpace.followers"
            label="Seguidores"
            placeholder="Ej: 25000"
            aria-label="seguidores"
            value={adSpace?.followers ?? ""}
          />
        );
      default:
        return textField(field, required);
    }
  };

  return (
    <section className="flex flex-col gap-4" id="ad-space-data">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Medio</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AD_SPACE_MEDIUMS.map((medium) => {
            const Icon = medium.icon;
            const selected = adSpace?.medium === medium.key;
            return (
              <Button
                key={medium.key}
                variant={selected ? "solid" : "flat"}
                color="warning"
                className={`h-16 flex-col gap-1 ${selected ? "text-white" : ""}`}
                isDisabled={!canChangeMedium && !selected}
                onPress={() =>
                  setFieldValue("adSpace.medium", medium.key as AdSpaceMedium)
                }
              >
                <Icon className="size-5" />
                {medium.label}
              </Button>
            );
          })}
        </div>
      </div>

      {info && (
        <>
          <Field
            as={CustomInput}
            name="adSpace.mediaName"
            label={info.mediaNameLabel}
            aria-label={info.mediaNameLabel}
            isRequired
            value={adSpace.mediaName ?? ""}
          />

          {/* Alcance del medio: dirección, link o área. */}
          {info.reach === "place" && (
            <>
              {textField("placeAddress", true)}
              <p className="text-xs text-default-500">
                Es la dirección del cartel o pantalla. Más abajo elegís desde
                dónde se publica el anuncio y hasta qué distancia se ve.
              </p>
            </>
          )}
          {info.reach === "area" && (
            <div className="flex gap-4 max-xl:flex-wrap">
              <Field
                as={CustomSelect}
                items={AD_SPACE_COVERAGE}
                getItemValue={(i: any) => i.value}
                getItemLabel={(i: any) => i.label}
                getItemTextValue={(i: any) => i.label}
                name="adSpace.coverageArea"
                label="Alcance del medio"
                placeholder="Barrio, provincia, país…"
                aria-label="alcance del medio"
                isRequired
              />
              {textField("coverageName")}
            </div>
          )}
          <Field
            as={CustomInput}
            name="adSpace.mediaUrl"
            label={
              info.reach === "online"
                ? "Link al sitio o perfil"
                : "Link al medio (opcional)"
            }
            placeholder="https://"
            aria-label="link"
            isRequired={info.reach === "online"}
            value={adSpace.mediaUrl ?? ""}
          />

          <div className="grid gap-4 sm:grid-cols-2 items-start">
            {info.fields.map(mediumField)}
            {textField("audience")}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[0.8125rem] font-medium">
              Formatos que ofrecés
            </p>
            <div className="flex flex-wrap gap-2">
              {formats.map((format) => (
                <Chip
                  key={format}
                  onClose={() =>
                    setFieldValue(
                      "adSpace.formats",
                      formats.filter((f) => f !== format)
                    )
                  }
                  variant="flat"
                  color="warning"
                >
                  {format}
                </Chip>
              ))}
              {AD_SPACE_FORMAT_SUGGESTIONS[info.key]
                .filter((s) => !formats.includes(s))
                .map((suggestion) => (
                  <Chip
                    key={suggestion}
                    variant="bordered"
                    className="cursor-pointer"
                    startContent={<FaPlus className="size-3" />}
                    onClick={() => addFormat(suggestion)}
                  >
                    {suggestion}
                  </Chip>
                ))}
            </div>
            {formats.length < MAX_FORMATS && (
              <div className="flex items-end gap-2">
                <input
                  className="flex-1 rounded-full border-[0.5px] border-default-300 px-4 py-2 text-[0.8125rem]"
                  placeholder="Otro formato"
                  value={formatDraft}
                  onChange={(e) => setFormatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFormat(formatDraft);
                    }
                  }}
                  maxLength={60}
                />
                <Button
                  size="sm"
                  radius="full"
                  variant="flat"
                  onPress={() => addFormat(formatDraft)}
                >
                  Agregar
                </Button>
              </div>
            )}
          </div>
        </>
      )}
      {typeof errors.adSpace === "string" && (
        <p className="text-danger text-sm">{errors.adSpace}</p>
      )}
    </section>
  );
};

export default AdSpaceInputs;
