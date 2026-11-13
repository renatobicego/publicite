"use client";

import {
  Button,
  Card,
  CardBody,
  Input,
  Link,
  Radio,
  RadioGroup,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { useEffect, useMemo, useState } from "react";
import { FaGift } from "react-icons/fa6";

import UserPicker, { userDisplayName } from "@/components/inputs/UserPicker";
import { buyPlanGift, getPlanGiftQuote } from "@/services/planGiftServices";
import {
  BuyPlanGiftResult,
  monthsLabel,
  PlanGiftQuote,
} from "@/types/planGiftTypes";
import { User } from "@/types/userTypes";
import { MY_PLAN_GIFTS } from "@/utils/data/urls";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

const DEFAULT_MONTHS = [1, 2, 3, 5];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface GiftablePlan {
  mpPreapprovalPlanId: string;
  reason: string;
  description?: string;
}

const money = (value: number) =>
  `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

/*
Regalar un plan: se elige el plan y los meses, a quién (una cuenta o un email) y
se paga UNA vez con el Brick de tarjeta. El precio lo calcula el server (precio
mensual del plan × meses); acá sólo se muestra.
*/
export default function GiftPlanForm({
  plans,
  myUserId,
}: {
  plans: GiftablePlan[];
  myUserId: string;
}) {
  const { user } = useUser();
  const [planId, setPlanId] = useState(plans[0]?.mpPreapprovalPlanId ?? "");
  const [months, setMonths] = useState(3);
  const [quote, setQuote] = useState<PlanGiftQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [recipientMode, setRecipientMode] = useState<"account" | "email">(
    "account"
  );
  const [recipientUser, setRecipientUser] = useState<User | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [result, setResult] = useState<BuyPlanGiftResult | null>(null);

  const monthOptions = quote?.monthOptions ?? DEFAULT_MONTHS;

  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    setIsQuoting(true);
    setQuoteError(null);
    getPlanGiftQuote(planId, months)
      .then((response) => {
        if (cancelled) return;
        if ("error" in response) {
          setQuote(null);
          setQuoteError(response.error);
          return;
        }
        setQuote(response);
      })
      .finally(() => {
        if (!cancelled) setIsQuoting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [planId, months]);

  const emailIsValid = EMAIL_REGEX.test(recipientEmail.trim());
  const recipientReady =
    recipientMode === "account" ? !!recipientUser : emailIsValid;

  const recipientLabel = useMemo(() => {
    if (recipientMode === "account" && recipientUser) {
      return `${userDisplayName(recipientUser)} (@${recipientUser.username})`;
    }
    if (recipientMode === "email" && emailIsValid) return recipientEmail.trim();
    return null;
  }, [recipientMode, recipientUser, recipientEmail, emailIsValid]);

  const onSubmit = async (formData: any) => {
    if (!quote) return;
    const response = await buyPlanGift({
      mpPreapprovalPlanId: planId,
      months,
      ...(recipientMode === "account"
        ? { recipientUserId: recipientUser?._id }
        : { recipientEmail: recipientEmail.trim() }),
      cardTokenId: formData.token,
      paymentMethodId: formData.payment_method_id,
      issuerId: formData.issuer_id ? String(formData.issuer_id) : undefined,
      payerEmail:
        formData?.payer?.email ?? user?.emailAddresses[0]?.emailAddress ?? "",
      identificationType: formData?.payer?.identification?.type,
      identificationNumber: formData?.payer?.identification?.number,
    });
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess("¡Regalo hecho!");
    setResult(response);
  };

  if (plans.length === 0) {
    return (
      <p className="text-sm">
        En este momento no hay planes para regalar. Probá más tarde.
      </p>
    );
  }

  if (result) {
    return <GiftDone result={result} recipientLabel={recipientLabel} />;
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">1. Elegí el plan</h2>
        <RadioGroup
          value={planId}
          onValueChange={setPlanId}
          orientation="horizontal"
          aria-label="Plan a regalar"
        >
          {plans.map((plan) => (
            <Radio key={plan.mpPreapprovalPlanId} value={plan.mpPreapprovalPlanId}>
              {plan.reason}
            </Radio>
          ))}
        </RadioGroup>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">2. ¿Cuántos meses?</h2>
        <div className="flex flex-wrap gap-2">
          {monthOptions.map((option) => (
            <Button
              key={option}
              size="sm"
              radius="full"
              color={option === months ? "primary" : "default"}
              variant={option === months ? "solid" : "bordered"}
              onPress={() => setMonths(option)}
            >
              {monthsLabel(option)}
            </Button>
          ))}
        </div>
        <div className="text-sm min-h-6">
          {isQuoting ? (
            <Spinner size="sm" />
          ) : quoteError ? (
            <span className="text-danger">{quoteError}</span>
          ) : quote ? (
            <span>
              Total: <strong className="text-lg">{money(quote.amount)}</strong>{" "}
              ({monthsLabel(quote.months)} de {quote.planReason}, en un solo
              pago)
            </span>
          ) : null}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">3. ¿A quién se lo regalás?</h2>
        <Tabs
          aria-label="Destinatario"
          selectedKey={recipientMode}
          onSelectionChange={(key) =>
            setRecipientMode(key === "email" ? "email" : "account")
          }
          size="sm"
          radius="full"
        >
          <Tab key="account" title="Ya está en Soon">
            <UserPicker
              label="Usuario"
              excludeIds={[myUserId]}
              onSelect={setRecipientUser}
              description="Le avisamos por notificación y lo activa cuando quiera."
            />
          </Tab>
          <Tab key="email" title="Todavía no tiene cuenta">
            <Input
              type="email"
              label="Email de la persona"
              labelPlacement="outside"
              placeholder="nombre@ejemplo.com"
              variant="bordered"
              radius="full"
              value={recipientEmail}
              onValueChange={setRecipientEmail}
              isInvalid={recipientEmail.length > 0 && !emailIsValid}
              errorMessage="Revisá el email."
              description="Te damos un link para mandarle. Cuando se registre con este email, el regalo aparece en su cuenta. Si ya tiene cuenta con ese email, va directo a su cuenta."
            />
          </Tab>
        </Tabs>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">4. Pagá</h2>
        <p className="text-sm text-light-text">
          Es un pago único: no se renueva solo. El plan dura{" "}
          {monthsLabel(months)} desde que la persona lo activa. No se le puede
          regalar a quien ya tiene un plan pago.
        </p>
        {quote && recipientReady ? (
          <CardPayment
            key={`${planId}-${months}-${quote.amount}`}
            initialization={{
              amount: quote.amount,
              payer: { email: user?.emailAddresses[0]?.emailAddress },
            }}
            onSubmit={onSubmit}
            onError={(error: any) =>
              toastifyError(String(error?.message ?? error))
            }
            locale="es-AR"
            customization={{ paymentMethods: { maxInstallments: 1 } }}
          />
        ) : (
          <p className="text-sm">
            Elegí el plan, los meses y a quién se lo regalás para pagar.
          </p>
        )}
      </section>
    </div>
  );
}

function GiftDone({
  result,
  recipientLabel,
}: {
  result: BuyPlanGiftResult;
  recipientLabel: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const absoluteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}${result.link}`
      : result.link;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteLink);
      setCopied(true);
    } catch {
      toastifyError("No se pudo copiar. Copialo a mano.");
    }
  };

  return (
    <Card shadow="sm" className="w-full">
      <CardBody className="flex flex-col gap-4 items-start">
        <div className="flex items-center gap-3">
          <FaGift className="text-primary size-8" />
          <h2 className="text-xl font-semibold">Regalo hecho</h2>
        </div>
        {recipientLabel && (
          <p className="text-sm">
            Para: <strong>{recipientLabel}</strong>
          </p>
        )}
        <p className="text-sm">{result.message}</p>
        <div className="flex flex-col gap-1 w-full">
          <span className="text-sm font-medium">Link del regalo</span>
          <div className="flex flex-wrap gap-2 items-center">
            <code className="text-xs bg-default-100 rounded-lg px-3 py-2 break-all">
              {absoluteLink}
            </code>
            <Button size="sm" radius="full" onPress={copy}>
              {copied ? "Copiado" : "Copiar link"}
            </Button>
          </div>
        </div>
        <Link href={MY_PLAN_GIFTS} size="sm">
          Ver mis regalos
        </Link>
      </CardBody>
    </Card>
  );
}
