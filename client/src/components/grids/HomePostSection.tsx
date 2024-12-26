"use client"
import { Suspense } from 'react';
import { fetchDataByType } from "@/utils/data/fetchDataByType";
import PostsGrid from "@/components/grids/PostGrid";
import SecondaryButton from "@/components/buttons/SecondaryButton";
import { Post } from "@/types/postTypes";
import { Link, Spinner } from "@nextui-org/react";
import { useInfiniteFetch } from '@/utils/hooks/useInfiniteFetch';

interface PostSectionProps {
  type: "good" | "service" | "petition";
  title: string;
  buttonText: string;
  buttonHref: string;
}

function PostFetcher({ type }: { type: "good" | "service" | "petition" }) {
  const {items, isLoading} = useInfiniteFetch(type);

  if (isLoading) return <Spinner color="warning" />

  return <PostsGrid posts={items as Post[]} recommendation={false} />;
}

export default function HomePostSection({ type, title, buttonText, buttonHref }: PostSectionProps) {
  return (
    <section className='flex flex-col gap-4 w-full'>
      <h2 className="mb-4">{title}</h2>
      <Suspense fallback={<Spinner color="warning" />}>
        <PostFetcher type={type} />
      </Suspense>
      <SecondaryButton as={Link} href={buttonHref} className="self-center mt-4">
        {buttonText}
      </SecondaryButton>
    </section>
  );
}

