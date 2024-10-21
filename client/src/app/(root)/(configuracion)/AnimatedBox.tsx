import { AnimatePresence, motion } from "framer-motion";

const AnimatedBox = ({
  isVisible,
  children,
  className,
  keyValue
}: {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
  keyValue: string;
}) => {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isVisible ? (
        <motion.div
          key={"form" + keyValue}
          initial={{ opacity: 0, translateY: "-50%" }}
          animate={{ opacity: 1, translateY: "0%" }}
          exit={{ opacity: 0, translateY: "-50%" }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key={"data" + keyValue}
          initial={{ opacity: 0, translateY: "50%" }}
          animate={{ opacity: 1, translateY: "0%" }}
          exit={{ opacity: 0, translateY: "50%" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedBox;
