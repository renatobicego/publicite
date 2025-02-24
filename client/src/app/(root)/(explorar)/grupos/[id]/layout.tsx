import { Suspense, lazy } from "react";
import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { GROUPS } from "@/utils/data/urls";
import ErrorCard from "@/components/ErrorCard";
import { currentUser } from "@clerk/nextjs/server";
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
    console.log(groupData.error2);
    return (
      <ErrorCard
        message={groupData.error}
        error={groupData.error2.toString()}
      />
    );
  }

  const { group, isMember } = groupData;
  const loggedUser = await currentUser();
  if (!loggedUser) {
    redirect("/iniciar-sesion");
  }

  const breadcrumbsItems = [
    { label: "Inicio", href: "/" },
    { label: "Grupos", href: GROUPS },
    { label: group.name, href: `${GROUPS}/${params.id}` },
  ];

  const isCreator = loggedUser.publicMetadata.mongoId === group.creator._id;
  const isAdmin =
    group.admins.some(
      (admin) =>
        (admin as User)._id === (loggedUser?.publicMetadata.mongoId as string)
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
            <Suspense
              fallback={<Skeleton className="w-full h-20 rounded-lg" />}
            >
              <GroupSolapas group={group} isAdmin={isAdmin} />
            </Suspense>
            <Suspense
              fallback={<Skeleton className="w-full h-96 rounded-lg" />}
            >
              {children}
            </Suspense>
          </>
        ) : (
          <Suspense fallback={<Skeleton className="w-full h-40 rounded-lg" />}>
            <JoinGroupCard groupId={params.id} />
          </Suspense>
        )}
      </main>
    </Suspense>
  );
}
