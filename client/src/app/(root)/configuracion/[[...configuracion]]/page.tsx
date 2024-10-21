"use client";
import { CONFIGURATION } from "@/utils/data/urls";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { BiSolidUserDetail } from "react-icons/bi";
import Profile from "./Profile";

const UserProfilePage = () => {
  const { user } = useUser();
  const [userType, setUserType] = useState(user?.publicMetadata?.userType);

  useEffect(() => {
    if (userType === user?.publicMetadata?.userType) return;
    setUserType(user?.publicMetadata?.userType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.publicMetadata?.userType]);

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
            label="Perfil"
            labelIcon={<BiSolidUserDetail className="size-4" />}
            url="perfil"
            key="Profile"
          >
            <Profile />
          </UserProfile.Page>
        );
      default:
        return null;
    }
  }, [userType]);
  console.log("render page");
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
        <UserProfile.Page label="security" />
      </UserProfile>
    </main>
  );
};

export default UserProfilePage;
