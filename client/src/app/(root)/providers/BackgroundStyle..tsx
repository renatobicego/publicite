"use client";
import { useEffect } from "react";
import { useBackground } from "./backgroundProvider";

const BackgroundStyle = () => {
  const { gradientValue } = useBackground();

  useEffect(() => {
    console.log(gradientValue);
    const opacity = (gradientValue as any) / 100;
    const gradient = `radial-gradient(circle at 10% 20%, 
          rgba(255, 131, 61, ${opacity}) 0%, 
          rgba(249, 183, 23, ${opacity}) 90%)`;

    document.body.style.background = gradient;
  }, [gradientValue]);

  return null;
};

export default BackgroundStyle;
