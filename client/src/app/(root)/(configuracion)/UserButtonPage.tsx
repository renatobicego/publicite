"use client";
import { useMemo } from "react";
import { UserButton } from "@clerk/nextjs";
import { BiSolidUserDetail } from "react-icons/bi";
import { FaSliders, FaUser } from "react-icons/fa6";
import Profile from "./Profile/Profile";
import Subscriptions from "./Subscriptions/Subscriptions";
import { MdPayments } from "react-icons/md";
import Preferences from "./Preferences/Preferences";
import { PROFILE } from "@/utils/data/urls";
import Business from "./Business/Business";
import { IoBusiness } from "react-icons/io5";
import { useUserData } from "../providers/userDataProvider";

const UserButtonModal = () => {
  const { userTypeLogged, usernameLogged, userIdLogged } = useUserData();
  const pageToReturn = useMemo(() => {
    switch (userTypeLogged) {
      case "Person":
        return (
          <UserButton.UserProfilePage
            label="Perfil"
            labelIcon={<BiSolidUserDetail className="size-4" />}
            url="perfil"
            key="Profile"
          >
            <Profile username={usernameLogged as string} />
          </UserButton.UserProfilePage>
        );
      case "Business":
        return (
          <UserButton.UserProfilePage
            label="Empresa"
            url="empresa"
            labelIcon={<IoBusiness className="size-4" />}
            key="Business"
          >
            <Business username={usernameLogged as string} />
          </UserButton.UserProfilePage>
        );
      default:
        return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserButton
      appearance={{
        elements: {
          rootBox: "size-8",
          avatarBox: "h-full w-full border-[0.8px]",
        },
      }}
      userProfileUrl={`${PROFILE}/${userIdLogged}`}
    >
      <UserButton.MenuItems>
        {/* <UserButton.Link
          label="Mi Perfil"
          labelIcon={<FaUser />}
          href={`${PROFILE}/${userIdLogged}`}
        /> */}
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
      {pageToReturn}
      <UserButton.UserProfilePage
        label="Suscripción"
        labelIcon={<MdPayments className="size-4" />}
        url="suscripcion"
      >
        <Subscriptions />
      </UserButton.UserProfilePage>
      <UserButton.UserProfilePage label="security" />
      {/* <UserButton.UserProfilePage
        label="Privacidad"
        labelIcon={<FaEyeSlash className="size-4" />}
        url="privacidad"
      >
        <Privacy />
      </UserButton.UserProfilePage> */}
      {/* <UserButton.UserProfilePage
          label="Notificaciones"
          labelIcon={<FaBell className="size-4" />}
          url="notificaciones"
        >
          <Notifications />
        </UserButton.UserProfilePage> */}
      <UserButton.UserProfilePage
        label="Preferencias"
        labelIcon={<FaSliders className="size-4" />}
        url="preferencias"
      >
        <Preferences />
      </UserButton.UserProfilePage>
    </UserButton>
  );
};

export default UserButtonModal;
