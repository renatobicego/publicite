import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ErrorCard from "@/components/ErrorCard";
import PostsGrid from "@/components/grids/PostGrid";
import { getMagazineById } from "@/services/magazineService";
import { GROUPS, MAGAZINES, PROFILE } from "@/utils/data/urls";
import AccordionSections from "./Sections/AccordionSections";
import { auth } from "@clerk/nextjs/server";
import { Post } from "@/types/postTypes";
import { Group } from "@/types/groupTypes";
import { GetUser } from "@/types/userTypes";
import { getOwner, checkIsOwner, getProfileUrl } from "./utils";
import MagazineHeader from "./MagazineHeader";
import MagazineActions from "./MagazineActions";
import { GroupMagazine, Magazine, UserMagazine } from "@/types/magazineTypes";
import MagazineSectionActions from "./Sections/MagazineSectionActions";

export default async function MagazinePage(props: { params: { id: string } }) {
  const params = props.params;
  const authData = auth();
  const magazine: Magazine | { error: string } = await getMagazineById(
    params.id,
    await authData.getToken({ template: "testing" })
  );
  if (!magazine || "error" in magazine) {
    return (
      <ErrorCard
        message={
          magazine?.error ||
          "No se encontró la revista. Por favor intenta de nuevo."
        }
      />
    );
  }
  const userId = authData.sessionClaims?.metadata.mongoId;
  const owner = getOwner(magazine);
  const isOwner = checkIsOwner(magazine, owner, userId as string);
  const isOwnerTypeUser = magazine.ownerType === "user";
  const urlProfile = getProfileUrl(owner, isOwnerTypeUser);
  const ownerAsUser = owner as GetUser;
  const ownerAsGroup = owner as Group;

  const isCollaborator = isOwnerTypeUser
    ? (magazine as UserMagazine).collaborators.some(
        (collaborator) => collaborator._id === userId
      )
    : (magazine as GroupMagazine).allowedCollaborators.some(
        (collaborator) => collaborator._id === userId
      );
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

  const filteredActivePostsMagazine: Magazine = {
    ...magazine,
    sections: magazine.sections.map((section) => {
      return {
        ...section,
        posts: section.posts.filter((post: Post) => post.isActive),
      };
    }),
  };

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section
        id="magazine-data"
        className="w-full flex-col gap-4 flex items-center justify-center"
      >
        <MagazineHeader
          {...{
            magazine: filteredActivePostsMagazine,
            ownerAsUser,
            ownerAsGroup,
            urlProfile,
            isOwner,
            isOwnerTypeUser,
            canEdit: isOwner,
          }}
        />
        <MagazineActions
          isOwner={isOwner}
          magazine={filteredActivePostsMagazine}
          isCollaborator={isCollaborator}
        />
      </section>
      <div
        id="grid-posts-magazines"
        className="w-full relative flex flex-col gap-2"
      >
        {(isOwner || isCollaborator) && (
          <MagazineSectionActions
            magazineId={filteredActivePostsMagazine._id}
            groupId={!isOwnerTypeUser ? ownerAsGroup._id : undefined}
            ownerType={filteredActivePostsMagazine.ownerType}
            sections={filteredActivePostsMagazine.sections.filter(
              (section) => !section.isFatherSection
            )}
          />
        )}
        <PostsGrid
          posts={
            (filteredActivePostsMagazine.sections.find(
              (section) => section.isFatherSection
            )?.posts as Post[]) || []
          }
        />
      </div>
      {filteredActivePostsMagazine.sections.length > 1 && (
        <AccordionSections
          sections={filteredActivePostsMagazine.sections.filter(
            (section) => !section.isFatherSection
          )}
        />
      )}
    </main>
  );
}
