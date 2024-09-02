import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AnimatedBox = ({
  isVisible,
  children,
  className,
}: {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}) => {

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isVisible ? (
        <motion.div
          key={"form"}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key={"data"}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedBox;
