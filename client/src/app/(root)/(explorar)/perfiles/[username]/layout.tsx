import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { PROFILE } from "@/utils/data/urls";
import UserInfo from "./(components)/sections/UserInfo";
import { getUserByUsername } from "@/services/userServices";
import ErrorCard from "@/components/ErrorCard";
import BoardCard from "@/components/Board/Board";
import { currentUser } from "@clerk/nextjs/server";
import UserSolapas from "@/components/solapas/UserSolapas";
import CreateBoard from "@/components/Board/CreateBoard/CreateBoard";
import { redirect } from "next/navigation";

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
  const loggedUser = await currentUser();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }

  const user = await getUserByUsername(params.username);
  if (!user || "error" in user) {
    return <ErrorCard message={user?.error ?? "Error al cargar el perfil."} />;
  }
  const isMyProfile = user.username === loggedUser?.username;
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
        <UserInfo
          user={user}
          isMyProfile={isMyProfile}
          usernameLogged={loggedUser?.username as string}
        />
        {user.board || !isMyProfile ? (
          <BoardCard
            board={user.board}
            isMyBoard={isMyProfile}
            isProfile
            name={user.businessName || user.name}
          />
        ) : (
          <CreateBoard user={user} />
        )}
      </div>
      <UserSolapas
        user={user}
        loggedUser={{
          username: loggedUser?.username as string,
          _id: loggedUser?.publicMetadata.mongoId as string,
        }}
      />
      {children}
    </main>
  );
}
