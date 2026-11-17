"use client";

import { Avatar, Button, Card, CardBody, Input, Link, Spinner } from "@nextui-org/react";
import { useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FaAddressBook,
  FaArrowLeft,
  FaArrowRight,
  FaCalendarCheck,
  FaCheck,
  FaCircleInfo,
  FaCopy,
  FaEnvelope,
  FaGift,
  FaLocationDot,
  FaRotate,
  FaShareNodes,
  FaUserCheck,
  FaWhatsapp,
  FaXmark,
} from "react-icons/fa6";
import { HiCircleStack, HiSparkles } from "react-icons/hi2";

import UserPicker, { userDisplayName } from "@/components/inputs/UserPicker";
import CardPaymentBrick from "@/components/payments/CardPaymentBrick";
import GiftCube from "@/components/planGift/GiftCube";
import { useWizard, WizardSlide, WizardSteps } from "@/components/wizard/Wizard";
import { buyPlanGift, getPlanGiftQuote } from "@/services/planGiftServices";
import { BuyPlanGiftResult, monthsLabel, PlanGiftQuote } from "@/types/planGiftTypes";
import { User } from "@/types/userTypes";
import { MY_PLAN_GIFTS } from "@/utils/data/urls";
import { formatBytes } from "@/utils/functions/formatBytes";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import GiftCardPreview from "./GiftCardPreview";

const DEFAULT_MONTHS = [1, 2, 3, 5];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Desde este número un límite se muestra como "ilimitado" (el plan Gratis usa 9999999). */
const UNLIMITED = 100000;

const STEPS = [
  { step: 1, label: "Plan y meses" },
  { step: 2, label: "Para quién" },
  { step: 3, label: "Pagar" },
];

export interface GiftablePlan {
  mpPreapprovalPlanId: string;
  reason: string;
  description?: string;
  /** Precio por mes de la lista de planes; el que se cobra lo calcula el server. */
  price: number;
  postsLibresCount: number;
  postsAgendaCount: number;
  aiTokensPerMonth?: number;
  storageBytesLimit?: number;
}

type RecipientMode = "account" | "email";
type Quote = PlanGiftQuote & { planId: string };

const money = (value: number) =>
  `$${value.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

/*
Regalar un plan, en tres pasos: 1) plan y meses, 2) a quién (una cuenta o un
email) y 3) resumen y pago UNA vez con el Brick de tarjeta. Al costado (arriba en
el celular) se ve la tarjeta del regalo en vivo. El precio lo calcula el server
(precio mensual del plan en MP × meses); acá sólo se muestra.
*/
export default function GiftPlanForm({
  plans,
  myUserId,
}: {
  plans: GiftablePlan[];
  myUserId: string;
}) {
  const { user } = useUser();
  const { step, direction, go } = useWizard(1);
  const topRef = useRef<HTMLDivElement>(null);
  const [planId, setPlanId] = useState(plans[0]?.mpPreapprovalPlanId ?? "");
  const [months, setMonths] = useState(3);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("account");
  const [recipientUser, setRecipientUser] = useState<User | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [result, setResult] = useState<BuyPlanGiftResult | null>(null);

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
        setQuote({ ...response, planId });
      })
      .finally(() => {
        if (!cancelled) setIsQuoting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [planId, months]);

  // En el celular el paso nuevo empieza arriba: si quedó scrolleado, se sube.
  useEffect(() => {
    const element = topRef.current;
    if (element && element.getBoundingClientRect().top < 0) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  const plan = plans.find((option) => option.mpPreapprovalPlanId === planId) ?? plans[0];
  const monthOptions = quote?.monthOptions ?? DEFAULT_MONTHS;
  // Precio por mes: el del server (MP) cuando ya cotizó este plan; si no, el de la lista.
  const monthlyPrice =
    quote && quote.planId === planId ? quote.amount / quote.months : plan?.price ?? 0;
  const currentQuote = quote && quote.planId === planId && quote.months === months ? quote : null;

  const emailIsValid = EMAIL_REGEX.test(recipientEmail.trim());
  const recipientReady = recipientMode === "account" ? !!recipientUser : emailIsValid;
  const recipientLabel =
    recipientMode === "account"
      ? recipientUser
        ? userDisplayName(recipientUser)
        : null
      : emailIsValid
        ? recipientEmail.trim()
        : null;
  const giverName = user?.fullName || user?.firstName || null;

  // Hasta dónde se puede ir tocando el indicador de pasos.
  const maxStep = !currentQuote ? 1 : !recipientReady ? 2 : 3;
  const goTo = (target: number) => {
    if (target <= maxStep) go(target);
  };

  const onSubmit = async (formData: any) => {
    if (!currentQuote) return;
    const response = await buyPlanGift({
      mpPreapprovalPlanId: planId,
      months,
      ...(recipientMode === "account"
        ? { recipientUserId: recipientUser?._id }
        : { recipientEmail: recipientEmail.trim() }),
      cardTokenId: formData.token,
      paymentMethodId: formData.payment_method_id,
      issuerId: formData.issuer_id ? String(formData.issuer_id) : undefined,
      payerEmail: formData?.payer?.email ?? user?.emailAddresses[0]?.emailAddress ?? "",
      identificationType: formData?.payer?.identification?.type,
      identificationNumber: formData?.payer?.identification?.number,
    });
    if ("error" in response) {
      toastifyError(response.error);
      return;
    }
    toastifySuccess("¡Regalo hecho!");
    setResult(response);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startAnother = () => {
    setResult(null);
    setRecipientUser(null);
    setRecipientEmail("");
    go(1);
  };

  if (plans.length === 0 || !plan) {
    return (
      <Card shadow="sm" className="w-full max-w-xl mx-auto">
        <CardBody className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="size-20">
            <GiftCube float={false} />
          </div>
          <p className="text-sm">En este momento no hay planes para regalar. Probá más tarde.</p>
        </CardBody>
      </Card>
    );
  }

  if (result) {
    return (
      <GiftDone
        result={result}
        planName={plan.reason}
        months={months}
        recipientLabel={recipientLabel}
        onAnother={startAnother}
      />
    );
  }

  const preview = {
    planName: plan.reason,
    months,
    total: currentQuote ? money(currentQuote.amount) : null,
    recipient: recipientLabel,
    giverName,
  };

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div ref={topRef} className="flex min-w-0 flex-col gap-4 scroll-mt-28">
        <div className="lg:hidden">
          <GiftCardPreview {...preview} compact />
        </div>
        <WizardSteps steps={STEPS} current={step} onSelect={goTo} />

        <WizardSlide step={step} direction={direction}>
          <Card shadow="sm">
            <CardBody className="flex flex-col gap-6 p-4 sm:p-6">
              {step === 1 && (
                <>
                  <section className="flex flex-col gap-3">
                    <StepHeader
                      title="¿Qué plan le regalás?"
                      subtitle="Es el mismo plan que se contrata por mes, con todo lo que incluye."
                    />
                    <div role="radiogroup" aria-label="Plan a regalar" className="grid gap-3 sm:grid-cols-2">
                      {plans.map((option) => (
                        <PlanOption
                          key={option.mpPreapprovalPlanId}
                          plan={option}
                          price={
                            option.mpPreapprovalPlanId === planId ? monthlyPrice : option.price
                          }
                          selected={option.mpPreapprovalPlanId === planId}
                          onSelect={() => setPlanId(option.mpPreapprovalPlanId)}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="flex flex-col gap-3">
                    <StepHeader
                      title="¿Cuántos meses?"
                      subtitle="Pagás todo junto, una sola vez. No se renueva solo."
                    />
                    <div role="radiogroup" aria-label="Meses" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {monthOptions.map((option) => (
                        <MonthOption
                          key={option}
                          months={option}
                          total={money(monthlyPrice * option)}
                          selected={option === months}
                          onSelect={() => setMonths(option)}
                        />
                      ))}
                    </div>
                    {quoteError && <p className="text-sm text-danger">{quoteError}</p>}
                  </section>

                  <StepFooter>
                    <span className="hidden sm:block" />
                    <Button
                      color="primary"
                      radius="full"
                      className="w-full sm:w-auto"
                      endContent={<FaArrowRight />}
                      isDisabled={!currentQuote}
                      isLoading={isQuoting}
                      onPress={() => go(2)}
                    >
                      Siguiente
                    </Button>
                  </StepFooter>
                </>
              )}

              {step === 2 && (
                <>
                  <section className="flex flex-col gap-3">
                    <StepHeader
                      title="¿Para quién es?"
                      subtitle="Nunca para vos ni para alguien que ya tiene un plan pago."
                    />
                    <div role="radiogroup" aria-label="Destinatario" className="grid gap-3 sm:grid-cols-2">
                      <ChoiceTile
                        selected={recipientMode === "account"}
                        onSelect={() => setRecipientMode("account")}
                        icon={<FaUserCheck />}
                        title="Ya está en Soon"
                        description="Lo buscás por nombre y le llega una notificación."
                      />
                      <ChoiceTile
                        selected={recipientMode === "email"}
                        onSelect={() => setRecipientMode("email")}
                        icon={<FaEnvelope />}
                        title="Todavía no tiene cuenta"
                        description="Ponés su email y te damos un link para mandarle."
                      />
                    </div>
                  </section>

                  {recipientMode === "account" ? (
                    recipientUser ? (
                      <SelectedUser user={recipientUser} onClear={() => setRecipientUser(null)} />
                    ) : (
                      <UserPicker
                        label="Buscalo en Soon"
                        excludeIds={[myUserId]}
                        onSelect={setRecipientUser}
                        description="Le avisamos por notificación y lo activa cuando quiera."
                      />
                    )
                  ) : (
                    <Input
                      type="email"
                      label="Email de la persona"
                      labelPlacement="outside"
                      placeholder="nombre@ejemplo.com"
                      variant="bordered"
                      radius="full"
                      startContent={<FaEnvelope className="text-light-text" />}
                      value={recipientEmail}
                      onValueChange={setRecipientEmail}
                      isInvalid={recipientEmail.length > 0 && !emailIsValid}
                      errorMessage="Revisá el email."
                      description="Cuando se registre con este email, el regalo aparece en su cuenta. Si ya tiene cuenta con ese email, le llega directo."
                    />
                  )}

                  <StepFooter>
                    <Button variant="light" radius="full" startContent={<FaArrowLeft />} onPress={() => go(1)}>
                      Atrás
                    </Button>
                    <Button
                      color="primary"
                      radius="full"
                      className="w-full sm:w-auto"
                      endContent={<FaArrowRight />}
                      isDisabled={!recipientReady}
                      onPress={() => go(3)}
                    >
                      Siguiente
                    </Button>
                  </StepFooter>
                </>
              )}

              {step === 3 && (
                <>
                  <StepHeader title="Revisá y pagá" />
                  {currentQuote && recipientReady ? (
                    <>
                      <div className="flex flex-col gap-2 rounded-2xl border border-default-200 bg-default-50 p-4 text-sm">
                        <SummaryRow label="Plan" value={plan.reason} />
                        <SummaryRow label="Duración" value={`${monthsLabel(months)}, desde que lo activa`} />
                        <SummaryRow label="Para" value={recipientLabel ?? ""} />
                        <div className="my-1 border-t border-default-200" />
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">Total, en un solo pago</span>
                          <span className="text-2xl font-bold text-primary">{money(currentQuote.amount)}</span>
                        </div>
                      </div>
                      <ul className="flex flex-col gap-1.5 text-xs text-default-600 sm:text-sm">
                        <Note icon={<FaRotate />}>Pago único: no se renueva solo.</Note>
                        <Note icon={<FaCalendarCheck />}>
                          {months === 1
                            ? "El mes empieza a contar cuando lo activa."
                            : `Los ${months} meses empiezan a contar cuando lo activa.`}
                        </Note>
                        <Note icon={<FaCircleInfo />}>
                          No se le puede regalar a quien ya tiene un plan pago.
                        </Note>
                      </ul>
                      <CardPaymentBrick
                        key={`${planId}-${months}-${currentQuote.amount}`}
                        initialization={{
                          amount: currentQuote.amount,
                          payer: { email: user?.emailAddresses[0]?.emailAddress },
                        }}
                        onSubmit={onSubmit}
                        onError={(error: any) => toastifyError(String(error?.message ?? error))}
                        customization={{ paymentMethods: { maxInstallments: 1 } }}
                      />
                    </>
                  ) : (
                    <div className="flex justify-center py-6">
                      <Spinner />
                    </div>
                  )}
                  <StepFooter>
                    <Button variant="light" radius="full" startContent={<FaArrowLeft />} onPress={() => go(2)}>
                      Atrás
                    </Button>
                    <span className="hidden sm:block" />
                  </StepFooter>
                </>
              )}
            </CardBody>
          </Card>
        </WizardSlide>
      </div>

      <aside className="hidden flex-col gap-4 lg:sticky lg:top-28 lg:flex">
        <GiftCardPreview {...preview} />
        <HowItWorks />
      </aside>
    </div>
  );
}

/* ---------- Piezas del formulario ---------- */

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
      {subtitle && <p className="text-sm text-default-500">{subtitle}</p>}
    </div>
  );
}

function StepFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse items-stretch gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

function CheckDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-colors ${
        selected ? "border-primary bg-primary text-white" : "border-default-300 text-transparent"
      }`}
    >
      <FaCheck />
    </span>
  );
}

const optionBase =
  "relative rounded-2xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

function planFeatures(plan: GiftablePlan) {
  const count = (value: number, singular: string, plural: string) =>
    value >= UNLIMITED
      ? `${plural.charAt(0).toUpperCase()}${plural.slice(1)} ilimitados`
      : `${value.toLocaleString("es-AR")} ${value === 1 ? singular : plural}`;
  const features: { icon: React.ReactNode; label: string }[] = [];
  if (plan.postsLibresCount > 0) {
    features.push({
      icon: <FaLocationDot />,
      label: count(plan.postsLibresCount, "anuncio geolocalizado", "anuncios geolocalizados"),
    });
  }
  if (plan.postsAgendaCount > 0) {
    features.push({
      icon: <FaAddressBook />,
      label: count(plan.postsAgendaCount, "anuncio de agenda", "anuncios de agenda"),
    });
  }
  if ((plan.aiTokensPerMonth ?? 0) > 0) {
    features.push({
      icon: <HiSparkles />,
      label: `${plan.aiTokensPerMonth!.toLocaleString("es-AR")} tokens de IA por mes`,
    });
  }
  if ((plan.storageBytesLimit ?? 0) > 0) {
    features.push({
      icon: <HiCircleStack />,
      label: `${formatBytes(plan.storageBytesLimit!)} de almacenamiento`,
    });
  }
  return features;
}

function PlanOption({
  plan,
  price,
  selected,
  onSelect,
}: {
  plan: GiftablePlan;
  price: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const features = planFeatures(plan);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`${optionBase} flex flex-col gap-3 p-4 ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-default-200 bg-white hover:border-primary/40"
      }`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="font-semibold text-text-color">{plan.reason}</span>
          <span className="text-sm text-default-500">
            <strong className="text-xl text-text-color">{money(price)}</strong> por mes
          </span>
        </span>
        <CheckDot selected={selected} />
      </span>
      {features.length > 0 && (
        <span className="flex flex-col gap-1 border-t border-default-200 pt-2.5 text-xs text-default-600 sm:gap-1.5 sm:pt-3 sm:text-sm">
          {features.map((feature) => (
            <span key={feature.label} className="flex items-center gap-2">
              <span className="shrink-0 text-primary">{feature.icon}</span>
              {feature.label}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}

function MonthOption({
  months,
  total,
  selected,
  onSelect,
}: {
  months: number;
  total: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${monthsLabel(months)}: ${total}`}
      onClick={onSelect}
      className={`${optionBase} flex flex-col items-center px-2 py-3 text-center ${
        selected
          ? "border-primary bg-primary text-white shadow-md"
          : "border-default-200 bg-white hover:border-primary/40"
      }`}
    >
      <span className="text-2xl font-bold leading-none">{months}</span>
      <span className={`text-xs ${selected ? "text-white/85" : "text-default-500"}`}>
        {months === 1 ? "mes" : "meses"}
      </span>
      <span className={`mt-1.5 text-sm font-semibold ${selected ? "" : "text-text-color"}`}>{total}</span>
    </button>
  );
}

function ChoiceTile({
  selected,
  onSelect,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`${optionBase} flex items-start gap-3 p-4 ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-default-200 bg-white hover:border-primary/40"
      }`}
    >
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
          selected ? "bg-primary text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold text-text-color">{title}</span>
        <span className="text-sm text-default-500">{description}</span>
      </span>
      <CheckDot selected={selected} />
    </button>
  );
}

function SelectedUser({ user, onClear }: { user: User; onClear: () => void }) {
  const name = userDisplayName(user);
  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-3">
      <Avatar src={user.profilePhotoUrl} name={name} className="shrink-0" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-semibold">{name}</span>
        <span className="truncate text-xs text-default-500">
          @{user.username} · le llega una notificación
        </span>
      </div>
      <Button
        size="sm"
        variant="light"
        radius="full"
        className="ml-auto shrink-0"
        startContent={<FaXmark />}
        onPress={onClear}
      >
        Cambiar
      </Button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-default-500">{label}</span>
      <span className="truncate text-right font-medium">{value}</span>
    </div>
  );
}

function Note({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Elegís y pagás una vez", text: "El plan y cuántos meses le regalás." },
    {
      title: "Le llega el regalo",
      text: "Con una notificación si ya está en Soon, o con un link si todavía no tiene cuenta.",
    },
    { title: "Lo activa cuando quiera", text: "Los meses empiezan a contar desde ese momento." },
  ];
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-default-200 bg-white p-5">
      <h3 className="font-semibold">Cómo funciona</h3>
      <ol className="flex flex-col gap-3">
        {steps.map((item, index) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {index + 1}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium">{item.title}</span>
              <span className="text-xs text-default-500">{item.text}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Regalo hecho ---------- */

const BURST_COLORS = ["#EF2D56", "#FFC93C", "#8CD867", "#4FB6E8", "#9B7BE8", "#F6A054"];

/** Papelitos que salen una vez alrededor de Cubito (sin animaciones, no se muestran). */
function Burst() {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const distance = 72 + (index % 3) * 14;
        return (
          <motion.span
            key={index}
            className="absolute left-1/2 top-1/2 -ml-[5px] -mt-[5px] size-2.5 rounded-[3px]"
            style={{ backgroundColor: BURST_COLORS[index % BURST_COLORS.length] }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: [0, 1, 1, 0],
              scale: 1,
              rotate: 200,
            }}
            transition={{ duration: 1.3, ease: "easeOut", delay: 0.2 + (index % 4) * 0.05 }}
          />
        );
      })}
    </span>
  );
}

function GiftDone({
  result,
  planName,
  months,
  recipientLabel,
  onAnother,
}: {
  result: BuyPlanGiftResult;
  planName: string;
  months: number;
  recipientLabel: string | null;
  onAnother: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // El formulario sólo corre en el navegador (ssr: false), así que se puede mirar acá.
  const canShare = typeof navigator !== "undefined" && "share" in navigator;
  const absoluteLink =
    typeof window !== "undefined" ? `${window.location.origin}${result.link}` : result.link;
  const shareText = `Te regalé ${monthsLabel(months)} de ${planName} en Soon. Activalo acá:`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteLink);
      setCopied(true);
    } catch {
      toastifyError("No se pudo copiar. Copialo a mano.");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "Un regalo para vos en Soon", text: shareText, url: absoluteLink });
    } catch {
      // Cerró el menú de compartir.
    }
  };

  return (
    <Card shadow="sm" className="w-full max-w-xl mx-auto">
      <CardBody className="flex flex-col items-center gap-5 p-6 text-center sm:p-8">
        <div className="relative size-32">
          <Burst />
          <GiftCube happy />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold sm:text-3xl">¡Regalo hecho!</h2>
          <p className="text-default-600">
            {monthsLabel(months)} de <strong>{planName}</strong>
            {recipientLabel ? (
              <>
                {" "}
                para <strong>{recipientLabel}</strong>
              </>
            ) : null}
            .
          </p>
        </div>
        <p className="text-sm text-default-600">{result.message}</p>

        <div className="flex w-full flex-col gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <FaGift className="text-primary" />
            Link del regalo
          </span>
          <code className="break-all rounded-lg border border-default-200 bg-white px-3 py-2 text-xs">
            {absoluteLink}
          </code>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              radius="full"
              color="primary"
              startContent={copied ? <FaCheck /> : <FaCopy />}
              onPress={copy}
            >
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button
              size="sm"
              radius="full"
              variant="bordered"
              as={Link}
              isExternal
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${absoluteLink}`)}`}
              startContent={<FaWhatsapp />}
            >
              WhatsApp
            </Button>
            {canShare && (
              <Button
                size="sm"
                radius="full"
                variant="bordered"
                startContent={<FaShareNodes />}
                onPress={share}
              >
                Compartir
              </Button>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button radius="full" variant="light" startContent={<FaGift />} onPress={onAnother}>
            Hacer otro regalo
          </Button>
          <Button as={Link} href={MY_PLAN_GIFTS} radius="full" color="primary">
            Ver mis regalos
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
