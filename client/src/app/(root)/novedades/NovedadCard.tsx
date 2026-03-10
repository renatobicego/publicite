"use client";

import SecondaryButton from "@/components/buttons/SecondaryButton";
import { Novedad } from "@/types/novedades";
import {
  findFirstHeader,
  findFirstParagraph,
  findFirstImage,
  truncateText,
  formatDate,
} from "@/utils/functions/editorjs-parser";
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Image,
  Chip,
} from "@nextui-org/react";
import Link from "next/link";
import { FaPencil } from "react-icons/fa6";

interface NovedadCardProps {
  novedad: Novedad;
  isAdmin: boolean;
}

export function NovedadCard({ novedad, isAdmin }: NovedadCardProps) {
  const header = findFirstHeader(novedad.content);
  const paragraph = findFirstParagraph(novedad.content);
  const image = findFirstImage(novedad.content);

  const title = header?.text || "Sin título";
  const excerpt = paragraph ? truncateText(paragraph, 150) : "Sin descripción";
  const imageUrl =
    image?.url ||
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=400&fit=crop";

  return (
    <Card
      className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
      shadow="none"
    >
      {/* Image container with edit button overlay */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          classNames={{
            wrapper: "w-full h-full !max-w-full",
            img: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
          }}
          radius="none"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Admin edit button */}
        {isAdmin && (
          <Link
            href={`/novedades/admin/${novedad.id}`}
            className="absolute right-3 top-3 z-10"
          >
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-background/90 text-text-color backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground"
              aria-label="Editar novedad"
            >
              <FaPencil className="h-4 w-4" />
            </Button>
          </Link>
        )}

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <Chip className="text-xs bg-white" size="sm" variant="bordered">
            {formatDate(novedad.createdAt)}
          </Chip>
        </div>
      </div>

      <CardBody className="gap-3 p-5">
        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-text-color">
          {title}
        </h3>

        {/* Excerpt - 3 lines */}
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {excerpt}
        </p>
      </CardBody>

      <CardFooter className="px-5 pb-5 pt-0">
        <Link href={`/novedades/${novedad.id}`} className="w-full">
          <SecondaryButton>Leer más</SecondaryButton>
        </Link>
      </CardFooter>
    </Card>
  );
}
