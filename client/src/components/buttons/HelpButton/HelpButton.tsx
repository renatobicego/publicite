"use client";
import { Button, forwardRef } from "@nextui-org/react";
import { useState } from "react";
import { IoIosHelp } from "react-icons/io";
import Joyride from "react-joyride";
import { useTutorialSteps } from "./getTutorialSteps";
import { usePathname, useRouter } from "next/navigation";

const HelpButton = () => {
  const [run, setRun] = useState(false);
  const pathname = usePathname();

  // Get steps from the helper
  const steps = useTutorialSteps(pathname);

  const handleClickStart = () => {
    setRun(true);
  };

  return (
    <>
      <Joyride
        run={run}
        continuous
        scrollToFirstStep
        callback={(data) => {
          if (data.status === "finished" || data.status === "skipped") {
            setRun(false);
          }
        }}
        steps={steps}
        styles={{
          options: {
            zIndex: 10000, // Ensure the tutorial is above all UI
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
      <Button
        isIconOnly
        aria-label="Ayuda"
        color="secondary"
        size="lg"
        onPress={handleClickStart}
        radius="full"
        variant="light"
        className="fixed bottom-8 right-8 bg-fondo shadow"
      >
        <IoIosHelp className="size-16" />
      </Button>
    </>
  );
};

export default HelpButton;
