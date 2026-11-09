"use client";
import {
  Button,
  Divider,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useState } from "react";
import { IoIosHelp } from "react-icons/io";
import {
  ACTIONS,
  EventData,
  EVENTS,
  Joyride,
  ORIGIN,
  STATUS,
  TooltipRenderProps,
} from "react-joyride";
import { useTutorialSteps } from "./getTutorialSteps";
import { usePathname } from "next/navigation";
import PrimaryButton from "../PrimaryButton";
import { FaBookOpen, FaPlus, FaX } from "react-icons/fa6";
import GlosaryModal from "./GlosaryModal";
import { CREATE, CREATE_PRODUCTION } from "@/utils/data/urls";
import { useCreateActions } from "./createActions";

const CustomTooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => (
  <aside
    {...tooltipProps}
    className="relative flex flex-col items-end gap-4 bg-white p-4 rounded-xl max-w-xs md:max-w-md xl:max-w-lg"
  >
    {step.title && <h4>{step.title}</h4>}
    <div className="flex gap-1 items-start">
      {step.content}
      <Button
        {...closeProps}
        isIconOnly
        radius="full"
        aria-label="cerrar ayuda"
        variant="light"
        size="sm"
        className="-mt-1"
      >
        <FaX />
      </Button>
    </div>
    <div className="flex gap-2 items-center">
      {index > 0 && (
        <PrimaryButton {...backProps} variant="light">
          Atrás
        </PrimaryButton>
      )}
      {continuous && (
        <PrimaryButton {...primaryProps}>
          {isLastStep ? "Finalizar" : "Siguiente"}
        </PrimaryButton>
      )}
    </div>
  </aside>
);

/** Opción del menú Crear. */
const MenuEntry = ({
  icon,
  label,
  description,
  href,
  onPress,
  highlighted = false,
}: {
  icon?: React.ReactNode;
  label: string;
  description?: string;
  href?: string;
  onPress?: () => void;
  highlighted?: boolean;
}) => {
  const className = `flex w-full items-center gap-3 rounded-medium px-2 py-2 text-left transition-colors ${
    highlighted
      ? "bg-primary text-white hover:bg-primary/90"
      : "hover:bg-default-100"
  }`;
  const content = (
    <>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          highlighted ? "bg-white/20" : "bg-primary/10 text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <span
            className={`text-xs ${highlighted ? "text-white/80" : "text-default-500"}`}
          >
            {description}
          </span>
        )}
      </span>
    </>
  );
  return href ? (
    <Link href={href} onPress={onPress} className={`${className} text-inherit`}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onPress} className={className}>
      {content}
    </button>
  );
};

const HelpButton = () => {
  const [run, setRun] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const contextActions = useCreateActions();
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(0);

  // Get steps from the helper
  const steps = useTutorialSteps(pathname);

  const handleClickStart = () => {
    setStepIndex(0);
    setRun(true);
  };

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;
    if (action === ACTIONS.CLOSE) {
      setRun(false);
      setStepIndex(0);
    }

    if (
      [EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(
        type as "step:after" | "error:target_not_found"
      )
    ) {
      // Update state to advance the tour
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if (
      [STATUS.FINISHED, STATUS.SKIPPED].includes(
        status as "finished" | "skipped"
      )
    ) {
      // You need to set our running state to false, so we can restart if we click start again.
      setRun(false);
    }
  };

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 0;

  return (
    <>
      <Joyride
        run={run}
        continuous
        scrollToFirstStep
        onEvent={handleJoyrideCallback}
        steps={steps ?? []}
        stepIndex={stepIndex}
        tooltipComponent={CustomTooltip}
        options={{
          zIndex: 10000,
          primaryColor: "#007bff", // Customize the primary color
          textColor: "#333", // Customize the text color
        }}
        locale={{
          back: "Atrás",
          close: "Cerrar",
          last: "Finalizar",
          next: "Siguiente",
          nextWithProgress: "Siguiente ({current} de {total})",
          open: "Abrir",
          skip: "Omitir",
        }}
      />
      <Popover
        placement="top-end"
        isOpen={menuOpen}
        onOpenChange={setMenuOpen}
        offset={12}
      >
        <PopoverTrigger>
          <Button
            isIconOnly
            aria-label="Crear"
            color="primary"
            size="lg"
            radius="full"
            className="fixed bottom-8 right-4 md:right-8 lg:right-12 xl:right-16 3xl:right-[6%] z-40 flex flex-col gap-0 shadow-lg ring-4 ring-primary/20 w-16 h-16 md:w-14 md:h-14 xl:w-20 xl:h-20 transition-transform hover:scale-105"
          >
            <FaPlus
              className={`size-6 xl:size-8 transition-transform ${menuOpen ? "rotate-45" : ""}`}
            />
            <span className="text-[10px] xl:text-xs font-semibold leading-none mt-0.5">
              Crear
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 max-w-[calc(100vw-2rem)] items-stretch gap-1 p-2">
          {/* Dentro de un blog: crear en la carpeta abierta */}
          {contextActions && (
            <div className="flex flex-col gap-0.5">
              <p className="px-2 pt-1 pb-1 text-xs font-semibold uppercase tracking-wide text-default-500 line-clamp-1">
                {contextActions.title}
              </p>
              {contextActions.actions.map((action) => (
                <MenuEntry
                  key={action.key}
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                  onPress={() => {
                    setMenuOpen(false);
                    action.onAction();
                  }}
                />
              ))}
              <Divider className="my-1" />
            </div>
          )}

          <MenuEntry
            highlighted={!contextActions}
            icon={<FaBookOpen />}
            label="Crear nuevo blog"
            description="Tu espacio en Mis Producciones"
            href={CREATE_PRODUCTION}
            onPress={() => setMenuOpen(false)}
          />
          <MenuEntry
            icon={<FaPlus />}
            label="Crear otra cosa"
            description="Anuncio, necesidad, grupo o revista"
            href={CREATE}
            onPress={() => setMenuOpen(false)}
          />

          <Divider className="my-1" />
          <div className="flex items-center justify-between gap-1 px-1">
            <Button
              size="sm"
              variant="light"
              className="text-default-600"
              onPress={() => {
                setMenuOpen(false);
                handleClickStart();
              }}
            >
              Ver tutorial
            </Button>
            <GlosaryModal
              customButton={
                <Button size="sm" variant="light" className="text-default-600">
                  Glosario
                </Button>
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default HelpButton;
