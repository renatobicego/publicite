"use client";
import { Button } from "@nextui-org/react";
import { IoIosHelp } from "react-icons/io";
import Joyride, { CallBackProps } from "react-joyride";
import { useState } from "react";

const HelpButton = () => {
  const [run, setRun] = useState(false); // Initially, the tutorial doesn't run
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      target: "#navbar",
      content: "This is your navigation bar where you can find key features!",
    },
    {
      target: "#search",
      content: "Use this search bar to find what you're looking for quickly!",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index } = data;
    if (status === "finished" || action === "close") {
      setRun(false); // Stop the tour when finished or closed
    } else if (action === "reset" || status === "ready") {
      setRun(true); // Restart the tour if reset
    }
    setStepIndex(index);
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run} // Determines whether the tutorial is active
        continuous // Automatically transitions to the next step
        showProgress // Displays progress in the tooltip
        showSkipButton // Adds a "Skip" button to the tooltip
        disableOverlayClose // Prevents closing by clicking outside
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000, // Ensures Joyride is above other UI elements
          },
        }}
      />

      {/* Fixed help button */}
      <Button
        isIconOnly
        color="secondary"
        size="lg"
        radius="full"
        variant="light"
        className="fixed bottom-8 right-8 bg-fondo shadow z-[10001]"
        onClick={() => {
          setRun(true); // Start the tutorial immediately
          setStepIndex(0); // Restart from the first step
        }}
      >
        <IoIosHelp className="size-16" />
      </Button>
    </>
  );
};

export default HelpButton;
