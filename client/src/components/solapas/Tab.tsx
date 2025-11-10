import React from "react";
import { Tab as HeroUITab } from "@nextui-org/react";

interface TabProps extends React.ComponentProps<typeof HeroUITab> {
  icon?: React.ReactNode;
}

const Tab = (props: TabProps) => {
  return (
    <HeroUITab
      {...props}
      title={
        <div className="flex items-center space-x-2">
          {props.icon}
          <span>{props.title}</span>
        </div>
      }
    />
  );
};

export default Tab;
