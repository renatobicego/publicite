import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { GROUPS, PROFILE } from "@/utils/data/urls";
import { getUserByUsername } from "@/services/userServices";
import ErrorCard from "@/components/ErrorCard";
import BoardCard from "@/components/Board/Board";
import { currentUser } from "@clerk/nextjs/server";
import UserSolapas from "@/components/solapas/UserSolapas";
import GroupInfo from "./(components)/GroupInfo";
import { getGroupById } from "@/services/groupsService";
import GroupSolapas from "@/components/solapas/GroupSolapas";
import { Group } from "@/types/userTypes";

export default async function GroupLayout({
  children,
  params,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  const group = await getGroupById(params.id);
  if ("error" in group) {
    return <ErrorCard message={group.error} />;
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

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="items-start flex gap-4 justify-between w-full max-md:flex-wrap">
        <GroupInfo group={group as Group} />
      </div>
      <GroupSolapas group={group as Group} />
      {children}
    </main>
  );
}
