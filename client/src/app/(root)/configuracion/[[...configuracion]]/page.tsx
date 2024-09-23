"use client"
import { memo, useMemo } from "react";
import { UserProfile, useUser } from "@clerk/nextjs";
import { BiSolidUserDetail } from "react-icons/bi";
import { FaBell, FaEyeSlash, FaSliders } from "react-icons/fa6";
import Profile from "./Profile/Profile";
import Subscriptions from "./Subscriptions/Subscriptions";
import { MdPayments } from "react-icons/md";
import Privacy from "./Privacy/Privacy";
import Notifications from "./Notifications/Notifications";
import Preferences from "./Preferences/Preferences";
import { CONFIGURATION } from "@/utils/data/urls";
import Business from "./Business/Business";
import { IoBusiness } from "react-icons/io5";

const UserProfilePage = () => {
  const { user } = useUser();
  const userType = user?.publicMetadata?.userType;

  const pageToReturn = useMemo(() => {
    switch (userType) {
      case "Person":
        return (
          <UserProfile.Page
            label="Perfil"
            labelIcon={<BiSolidUserDetail className="size-4" />}
            url="perfil"
            key="Profile"
          >
            <Profile />
          </UserProfile.Page>
        );
      case "Business":
        return (
          <UserProfile.Page
            label="Empresa"
            url="empresa"
            labelIcon={<IoBusiness className="size-4" />}
            key="Business"
          >
            <Business />
          </UserProfile.Page>
        );
      default:
        return null;
    }
  }, [userType]);

  return (
    <main className="flex flex-col items-center min-h-screen main-style">
      <UserProfile
        path={`${CONFIGURATION}`}
        routing="path"
        appearance={{
          elements: {
            profileSectionTitleText: "font-normal",
            navbarButton: "font-normal",
            navbar: "bg-fondo max-lg:max-w-48",
          },
        }}
        
      >
        {pageToReturn}
        <UserProfile.Page
          label="Suscripción"
          labelIcon={<MdPayments className="size-4" />}
          url="suscripcion"
        >
          <Subscriptions />
        </UserProfile.Page>
        <UserProfile.Page label="security" />
        <UserProfile.Page
          label="Privacidad"
          labelIcon={<FaEyeSlash className="size-4" />}
          url="privacidad"
        >
          <Privacy />
        </UserProfile.Page>
        <UserProfile.Page
          label="Notificaciones"
          labelIcon={<FaBell className="size-4" />}
          url="notificaciones"
        >
          <Notifications />
        </UserProfile.Page>
        <UserProfile.Page
          label="Preferencias"
          labelIcon={<FaSliders className="size-4" />}
          url="preferencias"
        >
          <Preferences />
        </UserProfile.Page>
      </UserProfile>
    </main>
  );
};

export default memo(UserProfilePage);
