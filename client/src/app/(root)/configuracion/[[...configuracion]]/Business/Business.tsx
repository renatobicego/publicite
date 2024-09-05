import { Divider } from "@nextui-org/react";
import Description from "../Profile/Description/Description";
import SocialMedia from "../Profile/SocialMedia/SocialMedia";
import BusinessData from "./BusinessData";

const Business = () => {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="profile-title">Datos de Perfil - Empresa</h2>
      <Divider />
      <BusinessData />
      <Divider />
      <Description />
      <Divider />
      <SocialMedia />
    </section>
  );
};

export default Business;
