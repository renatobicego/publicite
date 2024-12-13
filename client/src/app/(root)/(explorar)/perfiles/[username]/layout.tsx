import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PROFILE } from "@/utils/data/urls";
import UserInfo from "./(components)/sections/UserInfo";
import { getFriendRequests, getUserByUsername } from "@/services/userServices";
import ErrorCard from "@/components/ErrorCard";
import BoardCard from "@/components/Board/Board";
import { auth } from "@clerk/nextjs/server";
import UserSolapas from "@/components/solapas/UserSolapas";
import CreateBoard from "@/components/Board/CreateBoard/CreateBoard";
import { redirect } from "next/navigation";
import { UserRelationNotification } from "@/types/userTypes";
import { toastifyError } from "@/utils/functions/toastify";

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
  const isMyContact =
    user.userRelations.find(
      (relation) =>
        relation.userA._id === loggedUser?.sessionClaims?.metadata.mongoId
    ) ||
    user.userRelations.find(
      (relation) =>
        relation.userB._id === loggedUser?.sessionClaims?.metadata.mongoId
    );

  let friendRequests: UserRelationNotification[] = [];
  if (isMyProfile) {
    const friendRequestsFromDb = await getFriendRequests(params.username);
    if (friendRequestsFromDb &&"error" in friendRequestsFromDb) {
      toastifyError(friendRequestsFromDb.error);
    } else {
      friendRequests = friendRequestsFromDb || [];
    }
  }
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
        <UserInfo
          user={user}
          isMyProfile={isMyProfile}
          isMyContact={isMyContact}
        />
        {user.board || !isMyProfile ? (
          <BoardCard
            board={user.board}
            isMyBoard={isMyProfile}
            isProfile
            name={
              "bussinessName" in user && user.bussinessName
                ? (user.bussinessName as string)
                : user.name
            }
          />
        ) : (
          <CreateBoard user={user} />
        )}
      </div>
      <UserSolapas
        user={user}
        isMyProfile={isMyProfile}
        friendRequests={friendRequests}
      />
      {children}
    </main>
  );
}
