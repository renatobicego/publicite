import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ShareButton from "@/components/buttons/ShareButton";
import ErrorCard from "@/components/ErrorCard";
import PostsGrid from "@/components/grids/PostGrid";
import { getMagazineById } from "@/services/magazineService";
import { MAGAZINES, PROFILE } from "@/utils/data/urls";
import { Avatar, Link } from "@nextui-org/react";
import AccordionSections from "./AccordionSections";
import { currentUser } from "@clerk/nextjs/server";
import { GroupMagazine, Magazine, Post, UserMagazine } from "@/types/postTypes";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import InviteCollabMagazine from "@/components/modals/InviteCollabMagazine";
import { GetUser, Group, User } from "@/types/userTypes";

export default async function MagazinePage({
  params,
}: {
  params: { id: string };
}) {
  const magazine: Magazine | { error: string } = await getMagazineById(
    params.id
  );
  console.log(magazine)
  if ("error" in magazine) {
    return <ErrorCard message={magazine.error} />;
  }
  const user = await currentUser();
  const isOwnerTypeUser = magazine.ownerType === "user";

  const owner = isOwnerTypeUser
    ? (magazine as UserMagazine).user
    : (magazine as GroupMagazine).group;
  
  const ownerAsUser = owner as GetUser;
  const ownerAsGroup = owner as Group;
  
  const isOwner = isOwnerTypeUser
    ? ownerAsUser.username === user?.username
    : ((magazine as GroupMagazine).allowedCollaborators as string[]).includes(
        user?.publicMetadata.mongoId as string
      );

  const urlProfile = isOwnerTypeUser
    ? `${PROFILE}/${ownerAsUser.username}`
    : `${PROFILE}/${ownerAsGroup._id}`;
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
      label: isOwnerTypeUser ? ownerAsUser.username : ownerAsGroup.name,
      href: urlProfile,
    },
    {
      label: magazine.name,
      href: `${MAGAZINES}/${magazine._id}`,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 xl:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <section className="w-full flex-col gap-4 flex items-center justify-center">
        <h2>{magazine.name}</h2>
        <p className="md:max-w-[75%] xl:max-w-[50%] text-center text-sm lg:text-base">
          {magazine.description}
        </p>
        <Link
          color="foreground"
          href={urlProfile}
          className="flex gap-2 items-center flex-col"
        >
          <Avatar src={ownerAsUser.profilePhotoUrl} size="lg" />
          <p className="font-semibold">
            {isOwnerTypeUser ? `@${ownerAsUser.username}` : ownerAsGroup.name}{" "}
          </p>
        </Link>
        <div className="flex gap-2 items-center max-md:flex-wrap justify-center">
          {!isOwner && (
            <>
              <SecondaryButton
                as={Link}
                href={`/editar${MAGAZINES}/${magazine._id}`}
              >
                Editar
              </SecondaryButton>
              <InviteCollabMagazine />
            </>
          )}
          <ShareButton post={magazine} />
        </div>
      </section>
      <PostsGrid
        posts={
          (magazine.sections.find((section) => section.isFatherSection)
            ?.posts as Post[]) || []
        }
      />
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
