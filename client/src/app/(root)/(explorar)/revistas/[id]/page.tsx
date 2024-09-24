import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import ShareButton from "@/components/buttons/ShareButton";
import ErrorCard from "@/components/ErrorCard";
import PostsGrid from "@/components/grids/PostGrid";
import { getMagazineById } from "@/services/magazineService";
import { MAGAZINES, PROFILE } from "@/utils/data/urls";
import { Avatar, Button, Link } from "@nextui-org/react";
import AccordionSections from "./AccordionSections";
import { currentUser } from "@clerk/nextjs/server";
import { Magazine } from "@/types/postTypes";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import InviteCollabMagazine from "@/components/modals/InviteCollabMagazine";

export default async function MagazinePage({
  params,
}: {
  params: { id: string };
}) {
  const magazine = await getMagazineById(params.id);
  const user = await currentUser();
  const isOwner = (magazine as any).owner.username === user?.username;
  if ("error" in magazine) {
    return <ErrorCard message={magazine.error} />;
  }

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
      label: magazine.owner.username,
      href: `${PROFILE}/${magazine.owner.username}`,
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
          href={`${PROFILE}/${magazine.owner.username}`}
          className="flex gap-2 items-center flex-col"
        >
          <Avatar src={magazine.owner.profilePhotoUrl} size="lg" />
          <p className="font-semibold">@{magazine.owner.username}</p>
        </Link>
        <div className="flex gap-2 items-center max-md:flex-wrap justify-center">
          {!isOwner && (
            <>
              <SecondaryButton
                as={Link}
                href={`${MAGAZINES}/${magazine._id}/editar`}
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
          magazine.sections.find((section) => section.isFatherSection)?.posts ||
          []
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
