import { Divider } from "@nextui-org/react";
import React from "react";
import AccountType from "./AccountType/AccountType";
import PaymentMethod from "./PaymentMethod/PaymentMethod";
import LimitPosts from "./LimitPosts/LimitPosts";

const Subscriptions = () => {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="profile-title">Datos de Subscripción</h2>
      <Divider />
      <AccountType />
      <Divider />
      <PaymentMethod />
      <Divider />
      <LimitPosts />
    </section>
  );
};

export default Subscriptions;
