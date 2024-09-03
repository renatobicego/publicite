import { AnimatePresence, motion } from "framer-motion";

const AnimatedBox = ({
  isVisible,
  children,
  className,
  key
}: {
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
  key: string;
}) => {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {isVisible ? (
        <motion.div
          key={"form" + key}
          initial={{ opacity: 0, translateY: "-50%" }}
          animate={{ opacity: 1, translateY: "0%" }}
          exit={{ opacity: 0, translateY: "-50%" }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key={"data" + key}
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
