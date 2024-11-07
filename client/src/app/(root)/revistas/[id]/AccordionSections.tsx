"use client";
import PostsGrid from "@/components/grids/PostGrid";
import EditMagazineSection from "@/components/modals/MagazineSection/EditMagazineSection";
import { MagazineSection } from "@/types/magazineTypes";
import { Post } from "@/types/postTypes";
import { Accordion, AccordionItem } from "@nextui-org/react";

const AccordionSections = ({ sections, magazineId }: { sections: MagazineSection[]; magazineId: string }) => {
  return (
    <Accordion
      variant="splitted"
      showDivider
      className="w-full flex gap-4 p-0"
      itemClasses={{
        title: "md:text-lg xl:text-xl",
        titleWrapper: "md:px-4 md:py-2",
        content: "pb-4 lg:pb-6 xl:pb-8",
        base: "shadow-md",
        indicator: "w-5 h-5 [&>svg]:w-5 [&>svg]:h-5",
      }}
    >
      {sections.map((section) => (
        <AccordionItem
          HeadingComponent={"h6"}
          key={section._id}
          title={section.title}
          startContent={<EditMagazineSection magazineId={magazineId}  />}
        >
          <PostsGrid posts={section.posts as Post[]} />
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionSections;
