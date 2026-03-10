"use client";

import { useEffect, useRef, useState } from "react";
import { Novedad } from "@/types/novedades";

import {
  findFirstHeader,
  findFirstParagraph,
  findFirstImage,
  truncateText,
  formatDate,
} from "@/utils/functions/editorjs-parser";

import { Card, CardBody, CardFooter, Image, Chip } from "@nextui-org/react";

import SecondaryButton from "@/components/buttons/SecondaryButton";
import Link from "next/link";

interface Props {
  novedades: Novedad[];
}

export default function NovedadesCarousel({ novedades }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollTo = (i: number) => {
    if (!ref.current) return;

    const width = ref.current.clientWidth;

    ref.current.scrollTo({
      left: width * i,
      behavior: "smooth",
    });

    setIndex(i);
  };

  useEffect(() => {
    // call scroll to each 5 seconds
    const interval = setInterval(() => {
      scrollTo((index + 1) % novedades.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [index, novedades.length]);

  return (
    <div className="w-full relative ">
      {/* slides */}
      <div
        ref={ref}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      >
        {novedades.map((novedad) => {
          const header = findFirstHeader(novedad.content);
          const paragraph = findFirstParagraph(novedad.content);
          const image = findFirstImage(novedad.content);

          const title = header?.text || "Sin título";
          const excerpt = paragraph
            ? truncateText(paragraph, 150)
            : "Sin descripción";

          const imageUrl =
            image?.url ||
            "https://images.unsplash.com/photo-1557683316-973673baf926?w=800";

          return (
            <div key={novedad.id} className="min-w-full snap-center">
              <Card
                className="overflow-hidden border border-border bg-card"
                shadow="none"
              >
                {/* image */}
                <div className="relative max-h-[60vh] overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={title}
                    radius="none"
                    classNames={{
                      wrapper: "w-full h-full !max-w-full",
                      img: "w-full h-full object-cover",
                    }}
                  />

                  <div className="absolute bottom-3 left-3">
                    <Chip
                      className="text-xs bg-white"
                      size="sm"
                      variant="bordered"
                    >
                      {formatDate(novedad.createdAt)}
                    </Chip>
                  </div>
                </div>

                {/* text */}
                <CardBody className="gap-3 p-5">
                  <h3 className="text-lg font-semibold leading-tight">
                    {title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {excerpt}
                  </p>
                </CardBody>

                <CardFooter className="px-5 pb-5 pt-0">
                  <Link href={`/novedades/${novedad.id}`} className="w-full">
                    <SecondaryButton>Leer más</SecondaryButton>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          );
        })}
      </div>

      {/* indicators */}
      <div className="flex justify-center gap-3 mt-6">
        {novedades.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-[4px] w-14 rounded-full transition-all ${
              i === index ? "bg-text-color" : "bg-text-color/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
