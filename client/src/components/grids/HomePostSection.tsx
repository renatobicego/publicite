"use client";
import { useInfiniteFetch } from "@/utils/hooks/useInfiniteFetch";
import { Link, Spinner } from "@nextui-org/react";
import { Suspense } from "react";
import PostsGrid from "./PostGrid";
import { Post } from "@/types/postTypes";
import SecondaryButton from "../buttons/SecondaryButton";

interface PostSectionProps {
  type: "good" | "service" | "petition" | "goodService";
  title: string;
  buttonText: string;
  buttonHref: string;
}

function PostFetcher({
  type,
}: {
  type: "good" | "service" | "petition" | "goodService";
}) {
  const { items, isLoading } =
    useInfiniteFetch({ typeOfData: "posts", postType: type });

  if (isLoading) return <Spinner color="warning" />;

  return <PostsGrid posts={items as Post[]} recommendation={false} />;
}

export default function HomePostSection({
  type,
  title,
  buttonText,
  buttonHref,
}: PostSectionProps) {
  return (
    <section className="flex flex-col gap-4 lg:gap-6 3xl:gap-8 w-full">
      <h2>{title}</h2>
      <Suspense fallback={<Spinner color="warning" />}>
        <PostFetcher
          type={type}
        />
      </Suspense>
      <SecondaryButton as={Link} href={buttonHref} className="self-center mt-4">
        {buttonText}
      </SecondaryButton>
    </section>
  );
}
