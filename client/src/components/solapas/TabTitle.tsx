import React from "react";

interface TabProps {
  icon?: React.ReactNode;
  title: string;
}

const TabTitle = (props: TabProps) => {
  const clonedIcon = props.icon
    ? React.cloneElement(props.icon as React.ReactElement, {
        className: "size-4 md:size-5 xl:size-6",
      })
    : null;
  return (
    <div className="flex items-center space-x-2 ">
      {clonedIcon}
      <span>{props.title}</span>
    </div>
  );
};

export default TabTitle;
