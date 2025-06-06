import { Divider, Spinner, user } from "@nextui-org/react";
import PersonalData from "./PersonalData/PersonalData";
import Description from "./Description/Description";
import SocialMedia from "./SocialMedia/SocialMedia";
import { useEffect, useState, memo } from "react";
import { EditPersonProfileProps } from "@/types/userTypes";
import { getProfileData } from "./actions";
import { toastifyError } from "@/utils/functions/toastify";

const MemoizedPersonalData = memo(PersonalData);
const MemoizedDescription = memo(Description);
const MemoizedSocialMedia = memo(SocialMedia);

const Profile = ({ username }: { username: string }) => {
  const [userData, setUserData] = useState<EditPersonProfileProps>();

  const getUserData = async () => {
    const data = await getProfileData(username);
    if (data.error) {
      toastifyError(data.error);
      return;
    }
    setUserData(data);
  };

  useEffect(() => {
    if (!userData) {
      getUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!userData) return <Spinner color="warning" />;
  return (
    <section className="flex flex-col gap-4 w-full">
      <h2 className="profile-title">Datos de Cartel</h2>

      <Divider />
      <MemoizedPersonalData data={userData} />
      <Divider />
      <MemoizedDescription
        description={userData.description}
        isBusiness={false}
      />
      <Divider />
      <MemoizedSocialMedia contact={userData.contact} />
    </section>
  );
};

export default memo(Profile);
