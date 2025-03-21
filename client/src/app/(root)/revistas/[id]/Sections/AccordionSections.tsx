"use client";
import PostsGrid from "@/components/grids/PostGrid";
import { MagazineSection } from "@/types/magazineTypes";
import { Post } from "@/types/postTypes";
import { Accordion, AccordionItem } from "@nextui-org/react";

const AccordionSections = ({ sections }: { sections: MagazineSection[] }) => {
  return (
    <Accordion
      variant="splitted"
      id="sections"
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
        >
          <PostsGrid posts={section.posts as Post[]} />
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionSections;
