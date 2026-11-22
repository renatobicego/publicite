"use client";
import { useEffect, useState } from "react";
import { Button, Chip, Input, Spinner } from "@nextui-org/react";
import { FaStar, FaTrash } from "react-icons/fa6";
import DataBox, { DataItem, EditButton } from "../../DataBox";
import FormCard from "../../FormCard";
import AnimatedBox from "../../AnimatedBox";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import {
  getMyPayoutAccounts,
  putMyPayoutAccounts,
} from "@/services/userServices";
import { PayoutAccount } from "@/types/userTypes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import {
  ALIAS_CBU_ERROR,
  isCbu,
  isValidAliasCbu,
} from "@/utils/functions/aliasCbu";

const MAX_ACCOUNTS = 10;
const MAX_LABEL = 40;

const describe = (account: PayoutAccount) =>
  `${account.label ? `${account.label}: ` : ""}${
    isCbu(account.aliasCbu) ? "CBU/CVU" : "Alias"
  } ${account.aliasCbu}`;

/**
 * Cuentas de cobro (alias o CBU/CVU) del usuario. Aparecen como opciones al
 * configurar el cobro de un ticket pago; la primera es la predeterminada.
 */
const PayoutAccounts = () => {
  const [accounts, setAccounts] = useState<PayoutAccount[]>();
  const [draft, setDraft] = useState<PayoutAccount[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newAlias, setNewAlias] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await getMyPayoutAccounts();
      if ("error" in res) {
        toastifyError(res.error);
        setAccounts([]);
        return;
      }
      setAccounts(res);
    })();
  }, []);

  const startEditing = () => {
    setDraft(accounts ?? []);
    setNewAlias("");
    setNewLabel("");
    setIsEditing(true);
  };

  const addAccount = () => {
    const aliasCbu = newAlias.trim();
    if (!isValidAliasCbu(aliasCbu)) {
      toastifyError(ALIAS_CBU_ERROR);
      return;
    }
    if (draft.some((a) => a.aliasCbu.toLowerCase() === aliasCbu.toLowerCase())) {
      toastifyError("Esa cuenta ya está en la lista");
      return;
    }
    setDraft([...draft, { label: newLabel.trim() || null, aliasCbu }]);
    setNewAlias("");
    setNewLabel("");
  };

  const makeDefault = (index: number) =>
    setDraft([draft[index], ...draft.filter((_, i) => i !== index)]);

  const remove = (index: number) =>
    setDraft(draft.filter((_, i) => i !== index));

  const save = async () => {
    // Lo escrito sin tocar "Agregar" también se guarda.
    let toSave = draft;
    if (newAlias.trim()) {
      if (!isValidAliasCbu(newAlias)) {
        toastifyError(ALIAS_CBU_ERROR);
        return;
      }
      toSave = [...draft, { label: newLabel.trim() || null, aliasCbu: newAlias.trim() }];
    }
    setSaving(true);
    const res = await putMyPayoutAccounts(toSave);
    setSaving(false);
    if ("error" in res) {
      toastifyError(res.error);
      return;
    }
    setAccounts(res);
    setIsEditing(false);
    toastifySuccess("Cuentas de cobro guardadas");
  };

  return (
    <AnimatedBox isVisible={isEditing} className="flex-1" keyValue="payout-accounts">
      {isEditing ? (
        <FormCard
          key="formPayoutAccounts"
          title="Cuentas de cobro"
          cardBodyClassname="flex flex-col gap-3"
        >
          <p className="text-xs text-default-500">
            Guardá tus alias o CBU/CVU. Cuando configures un ticket pago vas a
            poder elegir uno sin volver a escribirlo. La predeterminada (★) se
            propone primero.
          </p>
          {draft.length > 0 && (
            <ul className="flex flex-col gap-2">
              {draft.map((account, index) => (
                <li
                  key={account.aliasCbu}
                  className="flex items-center gap-2 rounded-lg border border-default-200 px-3 py-2 text-sm"
                >
                  <span className="flex-1 break-all">{describe(account)}</span>
                  {index === 0 ? (
                    <Chip size="sm" color="warning" variant="flat">
                      Predeterminada
                    </Chip>
                  ) : (
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      aria-label="Usar como predeterminada"
                      title="Usar como predeterminada"
                      onPress={() => makeDefault(index)}
                    >
                      <FaStar />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    isIconOnly
                    aria-label="Quitar cuenta"
                    onPress={() => remove(index)}
                  >
                    <FaTrash />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {draft.length < MAX_ACCOUNTS ? (
            <div className="flex flex-wrap items-end gap-2">
              <Input
                size="sm"
                label="Alias o CBU/CVU"
                value={newAlias}
                onValueChange={setNewAlias}
                className="min-w-48 flex-1"
              />
              <Input
                size="sm"
                label="Nombre (opcional)"
                placeholder="Ej: Banco Nación"
                value={newLabel}
                onValueChange={setNewLabel}
                maxLength={MAX_LABEL}
                className="min-w-40 flex-1"
              />
              <Button size="sm" variant="flat" onPress={addAccount}>
                Agregar
              </Button>
            </div>
          ) : (
            <p className="text-xs text-default-500">
              Llegaste al máximo de {MAX_ACCOUNTS} cuentas.
            </p>
          )}
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
          key="dataPayoutAccounts"
          className="max-md:my-2.5"
          labelText="Cuentas de cobro"
          labelClassname="md:w-1/4 md:my-2.5"
        >
          <DataItem asDiv className="flex-col items-start gap-1">
            {!accounts ? (
              <Spinner color="warning" size="sm" />
            ) : accounts.length === 0 ? (
              "Sin cuentas guardadas"
            ) : (
              accounts.map((account, index) => (
                <span key={account.aliasCbu} className="break-all">
                  {describe(account)}
                  {index === 0 && accounts.length > 1 && " ★"}
                </span>
              ))
            )}
          </DataItem>
          {accounts && (
            <EditButton
              text={accounts.length ? "Editar" : "Agregar"}
              onPress={startEditing}
            />
          )}
        </DataBox>
      )}
    </AnimatedBox>
  );
};

export default PayoutAccounts;
