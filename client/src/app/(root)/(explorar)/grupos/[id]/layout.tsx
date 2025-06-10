import { Suspense, lazy } from "react";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { GROUPS } from "@/utils/data/urls";
import ErrorCard from "@/components/ErrorCard";
import { auth } from "@clerk/nextjs/server";
import { getGroupById } from "@/services/groupsService";
import type { User } from "@/types/userTypes";
import type { GroupAdmin } from "@/types/groupTypes";
import Loading from "./loading";
import { Skeleton } from "@nextui-org/react";
import { redirect } from "next/navigation";

const GroupInfo = lazy(() => import("./(components)/GroupInfo"));
const GroupSolapas = lazy(() => import("@/components/solapas/GroupSolapas"));
const JoinGroupCard = lazy(() => import("./JoinGroupCard"));

export default async function GroupLayout(props: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const loggedUser = auth();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }
  const params = await props.params;
  const { children } = props;

  const groupData:
    | {
        group: GroupAdmin;
        isMember: boolean;
        hasJoinRequest: boolean;
        hasGroupRequest: boolean;
      }
    | { error: string; error2: string } = await getGroupById(params.id);

  if ("error" in groupData) {
    return (
      <ErrorCard
        message={groupData.error}
        error={groupData.error2?.toString()}
      />
    );
  }

  const { group, isMember } = groupData;

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Grupos", href: GROUPS },
    { label: group.name, href: `${GROUPS}/${params.id}` },
  ];

  const isCreator =
    loggedUser.sessionClaims?.metadata.mongoId === group.creator._id;
  const isAdmin =
    group.admins.some(
      (admin) =>
        (admin as User)._id ===
        (loggedUser?.sessionClaims?.metadata.mongoId as string)
    ) || isCreator;

  return (
    <Suspense fallback={<Loading />}>
      <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
        <BreadcrumbsAdmin items={breadcrumbsItems} />
        <Suspense fallback={<Skeleton className="rounded-lg w-full h-40" />}>
          <GroupInfo
            group={groupData}
            isAdmin={isAdmin}
            isCreator={isCreator}
          />
        </Suspense>
        {isMember ? (
          <>
            <GroupSolapas group={group} isAdmin={isAdmin} />

            {children}
          </>
        ) : (
          <JoinGroupCard groupId={params.id} />
        )}
      </main>
    </Suspense>
  );
}
