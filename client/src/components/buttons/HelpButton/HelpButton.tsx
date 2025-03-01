"use client";
import {
  Button,
  forwardRef,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useState } from "react";
import { IoIosHelp } from "react-icons/io";
import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  ORIGIN,
  STATUS,
  TooltipRenderProps,
} from "react-joyride";
import { useTutorialSteps } from "./getTutorialSteps";
import { usePathname, useRouter } from "next/navigation";
import PrimaryButton from "../PrimaryButton";
import { FaX } from "react-icons/fa6";

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
    className="w-full relative flex flex-col items-end gap-4 bg-white p-4 rounded-xl"
  >
    {step.title && <h4>{step.title}</h4>}
    <div>{step.content}</div>
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
    <Button
      {...closeProps}
      isIconOnly
      variant="flat"
      className="absolute top-2 right-2"
    >
      <FaX />
    </Button>
  </aside>
);

const HelpButton = () => {
  const [run, setRun] = useState(false);
  const pathname = usePathname();
  const [stepIndex, setStepIndex] = useState(0);

  // Get steps from the helper
  const steps = useTutorialSteps(pathname);

  const handleClickStart = () => {
    setStepIndex(0);
    setRun(true);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
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

  return (
    <>
      <Joyride
        run={run}
        continuous
        scrollToFirstStep
        callback={handleJoyrideCallback}
        steps={steps}
        stepIndex={stepIndex}
        tooltipComponent={CustomTooltip}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: "#007bff", // Customize the primary color
            textColor: "#333", // Customize the text color
          },
        }}
        locale={{
          back: "Atrás",
          close: "Cerrar",
          last: "Finalizar",
          next: "Siguiente",
          nextLabelWithProgress: "Siguiente (%current% de %total%)",
          open: "Abrir",
          skip: "Omitir",
        }}
      />
      <Popover placement="right">
        <PopoverTrigger>
          <Button
            isIconOnly
            aria-label="Ayuda"
            color="secondary"
            size="lg"
            radius="full"
            variant="light"
            className="fixed bottom-8 right-8 bg-fondo shadow"
          >
            <IoIosHelp className="size-16" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col">
          <Button onPress={handleClickStart}>Ver Tutorial</Button>
          <Button>Glosario</Button>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default HelpButton;
