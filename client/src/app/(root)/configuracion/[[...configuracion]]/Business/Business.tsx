import { Divider, Spinner } from "@nextui-org/react";
import Description from "../Profile/Description/Description";
import SocialMedia from "../Profile/SocialMedia/SocialMedia";
import BusinessData from "./BusinessData";
import { useEffect, useState } from "react";
import { EditBusinessProfileProps } from "@/types/userTypes";
import { getProfileData } from "../Profile/actions";

const Business = () => {
  const [userData, setUserData] = useState<EditBusinessProfileProps>();

  useEffect(() => {
    const getUserData = async () => {
      setUserData(await getProfileData());
    };
    if (!userData) {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if(!userData) return <Spinner color="warning"/>
  return (
    <section className="flex flex-col gap-4">
      <h2 className="profile-title">Datos de Perfil - Empresa</h2>
      <Divider />
      <BusinessData data={userData}/>
      <Divider />
      <Description description={userData.description}/>
      <Divider />
      <SocialMedia contact={userData.contact}/>
    </section>
  );
};

export default Business;