import { Button, Divider, Link } from "@nextui-org/react";
import React, { useState } from "react";
import AccountType from "./AccountType/AccountType";
import PaymentMethod from "./PaymentMethod/PaymentMethod";
import PayoutAccounts from "./PayoutAccounts/PayoutAccounts";
import LimitPosts from "./LimitPosts/LimitPosts";
import AiTokensLimit from "./AiTokens/AiTokensLimit";
import { AnimatePresence, motion } from "framer-motion";
import PaymentsTable from "./Payments/PaymentsTable";
import { FaChevronLeft } from "react-icons/fa6";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import DataBox, { DataItem } from "../DataBox";
import { FRIEND_PLAN, GIFT_PLAN, MY_PLAN_GIFTS } from "@/utils/data/urls";

const Subscriptions = () => {
  const [arePaymentsShown, setArePaymentsShown] = useState(false);
  const [showActivePosts, setShowActivePosts] = useState(false);
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
          <h2 className="profile-title">Datos de Suscripción</h2>
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
          <PayoutAccounts />
          <Divider />
          <DataBox labelText="Hacete Amigo">
            <DataItem asDiv>
              <Link href={FRIEND_PLAN} size="sm">
                Mi grupo e invitaciones
              </Link>
            </DataItem>
          </DataBox>
          <DataBox labelText="Regalos de planes">
            <DataItem asDiv className="flex-wrap gap-x-4">
              <Link href={MY_PLAN_GIFTS} size="sm">
                Mis regalos
              </Link>
              <Link href={GIFT_PLAN} size="sm">
                Regalar un plan
              </Link>
            </DataItem>
          </DataBox>
          <Divider />
          <AiTokensLimit />
          <Divider />
          {showActivePosts ? (
            <LimitPosts />
          ) : (
            <SecondaryButton onPress={() => setShowActivePosts(true)}>
              Ver Limites de Anuncios
            </SecondaryButton>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Subscriptions;
