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
    <AnimatePresence mode="popLayout" initial={false}>
      {isVisible ? (
        <motion.div
          key={"form" + Math.random()}
          initial={{ opacity: 0, translateY: "-50%" }}
          animate={{ opacity: 1, translateY: "0%" }}
          exit={{ opacity: 0, translateY: "-50%" }}
          className={className}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key={"data" + Math.random()}
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
