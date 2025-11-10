import { useBackground } from "@/app/(root)/providers/backgroundProvider";
import React from "react";

interface TabProps {
  icon?: React.ReactNode;
  title: string;
}

function interpolateColor(color1: string, color2: string, factor: number) {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));

  return `rgb(${r},${g},${b})`;
}

const TabTitle = (props: TabProps) => {
  const { gradientValue } = useBackground();
  const factor = (gradientValue as number) / 100;

  const color = interpolateColor("#F0931A", "#031926", factor);

  const clonedIcon = props.icon
    ? React.cloneElement(props.icon as React.ReactElement, {
        className: "size-4 md:size-5 xl:size-6",
        color,
      })
    : null;

  return (
    <div className="flex items-center space-x-2">
      {clonedIcon}
      <span>{props.title}</span>
    </div>
  );
};

export default TabTitle;
