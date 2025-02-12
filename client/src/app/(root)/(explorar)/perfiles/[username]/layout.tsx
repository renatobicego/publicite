import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PROFILE } from "@/utils/data/urls";
import UserInfo from "./(components)/sections/UserInfo";
import { getFriendRequests, getUserByUsername } from "@/services/userServices";
import ErrorCard from "@/components/ErrorCard";
import { auth } from "@clerk/nextjs/server";
import UserSolapas from "@/components/solapas/UserSolapas";
import { redirect } from "next/navigation";
import { UserRelationNotification, UserRelations } from "@/types/userTypes";
import { toastifyError } from "@/utils/functions/toastify";
import BoardLocalData from "./(components)/BoardLocalData";
import Loading from "./loading";
import { Suspense } from "react";

export default async function ProfileLayout(props: {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;

  const { children } = props;

  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Perfiles",
      href: PROFILE,
    },
    {
      label: params.username,
      href: `${PROFILE}/${params.username}`,
    },
  ];
  const loggedUser = auth();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }

  const user = await getUserByUsername(params.username);
  if (!user || "error" in user) {
    return <ErrorCard message={user?.error ?? "Error al cargar el perfil."} />;
  }
  const isMyProfile = user._id === loggedUser?.sessionClaims?.metadata.mongoId;

  let isMyContact: UserRelations | undefined;
  if (!isMyProfile) {
    isMyContact =
      user.userRelations?.find(
        (relation) =>
          relation.userA._id === loggedUser?.sessionClaims?.metadata.mongoId
      ) ||
      user.userRelations?.find(
        (relation) =>
          relation.userB._id === loggedUser?.sessionClaims?.metadata.mongoId
      );
  }

  let friendRequests: UserRelationNotification[] = [];
  if (isMyProfile) {
    const friendRequestsFromDb = await getFriendRequests(params.username);
    if (friendRequestsFromDb && "error" in friendRequestsFromDb) {
      toastifyError(friendRequestsFromDb.error);
    } else {
      friendRequests = friendRequestsFromDb || [];
    }
  }
  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
        <BreadcrumbsAdmin items={breadcrumbsItems} />
        <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
          <Suspense
            fallback={
              <div className="h-40 w-full max-w-md bg-gray-200 animate-pulse rounded-lg"></div>
            }
          >
            <UserInfo
              user={user}
              isMyProfile={isMyProfile}
              isMyContact={isMyContact}
            />
          </Suspense>
          <Suspense
            fallback={
              <div className="h-40 w-full max-w-md bg-gray-200 animate-pulse rounded-lg"></div>
            }
          >
            <BoardLocalData
              board={user.board}
              user={user}
              isMyProfile={isMyProfile}
            />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="h-20 w-full bg-gray-200 animate-pulse rounded-lg"></div>
          }
        >
          <UserSolapas
            user={user}
            isMyProfile={isMyProfile}
            friendRequests={friendRequests}
          />
        </Suspense>
        {children}
      </main>
    </Suspense>
  );
}
