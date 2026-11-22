"use client";
import { useState } from "react";
import { Button, Input, Select, SelectItem, Spinner, Textarea } from "@nextui-org/react";
import DataBox, { DataItem, EditButton } from "../DataBox";
import FormCard from "../FormCard";
import AnimatedBox from "../AnimatedBox";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { useUserData } from "../../providers/userDataProvider";
import { useAdAgentProfile } from "@/utils/hooks/useAdAgentProfile";
import { putMyAdAgentProfile } from "@/services/userServices";
import {
  AD_AGENT_TAX_CONDITIONS,
  adAgentTaxLabel,
} from "@/utils/data/adSpaces";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

/**
 * Sitio web oficial e impuestos de la cuenta Empresa / Agente (se muestran en
 * cada espacio publicitario). Sólo aparece si la cuenta es agente.
 */
const AdAgentEditor = () => {
  const { userIdLogged } = useUserData();
  const { profile, loading, setProfile } = useAdAgentProfile(userIdLogged);
  const [isEditing, setIsEditing] = useState(false);
  const [website, setWebsite] = useState("");
  const [taxCondition, setTaxCondition] = useState("");
  const [taxNote, setTaxNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading) return <Spinner color="warning" size="sm" />;
  if (!profile) return null;

  const startEditing = () => {
    setWebsite(profile.website);
    setTaxCondition(profile.taxCondition);
    setTaxNote(profile.taxNote);
    setIsEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await putMyAdAgentProfile({ website, taxCondition, taxNote });
    setSaving(false);
    if ("error" in res) {
      toastifyError(res.error);
      return;
    }
    setProfile(res);
    setIsEditing(false);
    toastifySuccess("Datos de agente guardados");
  };

  return (
    <AnimatedBox isVisible={isEditing} className="flex-1" keyValue="ad-agent">
      {isEditing ? (
        <FormCard
          key="formAdAgent"
          title="Empresa / Agente"
          cardBodyClassname="flex flex-col gap-3"
        >
          <Input
            size="sm"
            label="Sitio web oficial"
            value={website}
            onValueChange={setWebsite}
            isRequired
          />
          <Select
            size="sm"
            label="Condición frente al IVA"
            selectedKeys={taxCondition ? [taxCondition] : []}
            onChange={(e) => setTaxCondition(e.target.value)}
            isRequired
          >
            {AD_AGENT_TAX_CONDITIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </Select>
          <Textarea
            size="sm"
            label="Explicación de impuestos"
            value={taxNote}
            onValueChange={setTaxNote}
            maxLength={1000}
            isRequired
          />
          <div className="flex w-full items-center justify-end gap-2">
            <Button
              variant="light"
              radius="full"
              onPress={() => setIsEditing(false)}
              isDisabled={saving}
            >
              Cancelar
            </Button>
            <PrimaryButton onClick={save} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </PrimaryButton>
          </div>
        </FormCard>
      ) : (
        <DataBox
          key="dataAdAgent"
          className="max-md:my-2.5"
          labelText="Empresa / Agente"
          labelClassname="md:w-1/4 md:my-2.5"
        >
          <DataItem asDiv className="flex-col items-start gap-1">
            <span className="break-all">{profile.website}</span>
            <span>{adAgentTaxLabel(profile.taxCondition)}</span>
            <span className="text-xs text-light-text whitespace-pre-line">
              {profile.taxNote}
            </span>
          </DataItem>
          <EditButton text="Editar" onPress={startEditing} />
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default AdAgentEditor;
