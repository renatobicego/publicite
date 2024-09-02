import { Button, Divider } from "@nextui-org/react";
import React, { useState } from "react";
import AccountType from "./AccountType/AccountType";
import PaymentMethod from "./PaymentMethod/PaymentMethod";
import LimitPosts from "./LimitPosts/LimitPosts";
import { AnimatePresence, motion } from "framer-motion";
import PaymentsTable from "./Payments/PaymentsTable";
import { FaChevronLeft } from "react-icons/fa6";
import SecondaryButton from "@/app/components/buttons/SecondaryButton";

const Subscriptions = () => {
  const [arePaymentsShown, setArePaymentsShown] = useState(false);
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {arePaymentsShown ? (
        <motion.section
          key="payments"
          initial={{ translateX: "100%", opacity: 0 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: "100%" }}
          className="flex flex-col gap-4 items-start"
        >
          <Button
            onClick={() => setArePaymentsShown(false)}
            size="sm"
            variant="light"
            startContent={<FaChevronLeft />}
            className="self-start"
          >
            Volver
          </Button>
          <h2 className="profile-title">Pagos Realizados</h2>
          <PaymentsTable />
        </motion.section>
      ) : (
        <motion.section
          key="data subscription"
          initial={{ opacity: 0, translateX: "-100%" }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: "-100%" }}
          className="flex flex-col gap-4"
        >
          <h2 className="profile-title">Datos de Subscripción</h2>
          <Divider />
          <AccountType />
          <Divider />
          <PaymentMethod />
          <SecondaryButton
            onClick={() => setArePaymentsShown(true)}
            variant="flat"
            className="self-center"
          >
            Ver Pagos Realizados
          </SecondaryButton>
          <Divider />
          <LimitPosts />
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Subscriptions;
