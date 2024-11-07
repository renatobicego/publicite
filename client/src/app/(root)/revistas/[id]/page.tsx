import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import PostsGrid from "@/components/grids/PostGrid";
import { getMagazineById } from "@/services/magazineService";
import { GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import AccordionSections from "./AccordionSections";
import { currentUser } from "@clerk/nextjs/server";
import { Post } from "@/types/postTypes";
import { Group } from "@/types/groupTypes";
import { GetUser } from "@/types/userTypes";
import { getOwner, checkIsOwner, getProfileUrl } from "./utils";
import MagazineHeader from "./MagazineHeader";
import MagazineActions from "./MagazineActions";
import { Magazine } from "@/types/magazineTypes";
import CreateMagazineSection from "@/components/modals/CreateMagazineSection";

export default async function MagazinePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const magazine: Magazine | { error: string } = await getMagazineById(
    params.id
  );
  if ("error" in magazine) {
    return <ErrorCard message={magazine.error} />;
  }
  const user = await currentUser();

  const owner = getOwner(magazine);
  const isOwner = checkIsOwner(magazine, owner, user);
  const isOwnerTypeUser = magazine.ownerType === "user";
  const urlProfile = getProfileUrl(owner, isOwnerTypeUser);
  const ownerAsUser = owner as GetUser;
  const ownerAsGroup = owner as Group;
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: isOwnerTypeUser ? "Perfiles" : "Grupos",
      href: isOwnerTypeUser ? PROFILE : GROUPS,
    },
    {
      label: isOwnerTypeUser ? ownerAsUser.username : ownerAsGroup.name,
      href: urlProfile,
    },
    {
      label: magazine.name,
      href: `${MAGAZINES}/${magazine._id}`,
    },
  ];
  console.log(magazine.sections)
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex-col gap-4 flex items-center justify-center">
        <MagazineHeader
          {...{
            magazine,
            ownerAsUser,
            ownerAsGroup,
            urlProfile,
            isOwner,
            isOwnerTypeUser,
          }}
        />
        <MagazineActions isOwner={isOwner} magazine={magazine} />
      </section>
      <div className="w-full relative">
        <CreateMagazineSection
          magazineId={magazine._id}
          groupId={!isOwnerTypeUser ? ownerAsGroup._id : undefined}
        />
        <PostsGrid
          posts={
            (magazine.sections.find((section) => section.isFatherSection)
              ?.posts as Post[]) || []
          }
        />
      </div>
      {magazine.sections.length > 1 && (
        <AccordionSections
          sections={magazine.sections.filter(
            (section) => !section.isFatherSection
          )}
        />
      )}
    </main>
  );
}
