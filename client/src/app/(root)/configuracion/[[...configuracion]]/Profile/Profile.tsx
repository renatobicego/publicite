import { Divider } from "@nextui-org/react";
import PersonalData from "./PersonalData/PersonalData";
import Description from "./Description/Description";
import SocialMedia from "./SocialMedia/SocialMedia";
import { useEffect, useState } from "react";
import { UserPerson } from "@/types/userTypes";
import { getProfileData } from "./actions";

const Profile = () => {
  const [userData, setUserData] = useState<UserPerson>();

  useEffect(() => {
    const getUserData = async () => {
      console.log(await getProfileData("Person"));
    };
    if (!userData) {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section className="flex flex-col gap-4">
      <h2 className="profile-title">Datos de Perfil</h2>
      <Divider />
      <PersonalData />
      <Divider />
      <Description />
      <Divider />
      <SocialMedia />
    </section>
  );
};

export default Profile;
