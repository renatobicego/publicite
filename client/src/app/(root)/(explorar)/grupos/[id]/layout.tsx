import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { GROUPS } from "@/utils/data/urls";
import ErrorCard from "@/components/ErrorCard";
import { auth, currentUser } from "@clerk/nextjs/server";
import GroupInfo from "./(components)/GroupInfo";
import { getGroupById } from "@/services/groupsService";
import GroupSolapas from "@/components/solapas/GroupSolapas";
import { User } from "@/types/userTypes";
import { Group } from "@/types/groupTypes";
import { FaLock } from "react-icons/fa6";
import { redirect } from "next/navigation";

export default async function GroupLayout(props: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;

  const { children } = props;

  const group: Group | { error: string; error2: string } = await getGroupById(
    params.id
  );
  if ("error" in group) {
    return <ErrorCard message={group.error} error={group.error2} />;
  }
  const loggedUser = await currentUser();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Grupos",
      href: GROUPS,
    },
    {
      label: group.name,
      href: `${GROUPS}/${params.id}`,
    },
  ];
  const isAdmin = group.admins.some(
    (admin) =>
      (admin as User)._id === (loggedUser?.publicMetadata.mongoId as string)
  );
  const isMember =
    group.members.some(
      (member) =>
        (member as User)._id === (loggedUser?.publicMetadata.mongoId as string)
    ) || isAdmin;

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
        <GroupInfo
          group={group as Group}
          isAdmin={isAdmin}
          isMember={isMember}
          userId={loggedUser.publicMetadata.mongoId as string}
        />
      </div>
      {isMember ? (
        <>
          <GroupSolapas
            group={group as Group}
            isAdmin={isAdmin}
            userLogged={{
              username: loggedUser.username as string,
              _id: loggedUser.publicMetadata.mongoId as string,
            }}
          />
          {children}
        </>
      ) : (
        <div className="flex flex-col gap-6 items-center justify-center w-full mt-8">
          <FaLock className="size-10 min-w-10 text-light-text" />
          <p className="text-center text-light-text text-small md:text-base">
            No eres miembro de este grupo. ¡Únete para acceder a su contenido!
          </p>
        </div>
      )}
    </main>
  );
}
