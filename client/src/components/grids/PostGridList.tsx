import { frequencyPriceItems } from "@/utils/data/selectData";
import { Good, Petition, Post, Service } from "@/types/postTypes";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Image,
  Divider,
  Link,
} from "@nextui-org/react";
import { useCallback } from "react";
import { FaStar } from "react-icons/fa6";
import SaveButton from "../buttons/SaveMagazine/SaveButton";
import ShareButton from "../buttons/ShareButton";
import { FILE_URL, POSTS } from "@/utils/data/urls";
import { MdQuestionAnswer } from "react-icons/md";

const PostGridList = ({
  items,
  isLoading,
  isSearchDone,
}: {
  items: any[];
  isLoading: boolean;
  isSearchDone: boolean;
}) => {
  const renderCell = useCallback(
    (
      data: Good | Service | Petition,
      columnKey: keyof Good | keyof Service | keyof Petition
    ) => {
      switch (columnKey) {
        case "imagesUrls":
          if (!("imagesUrls" in data)) {
            return (
              <div className="flex gap-2 2xl:gap-4 items-center justify-between">
                <Link href={`${POSTS}/${data._id}`}>
                  <MdQuestionAnswer className="text-petition size-14 ml-4" />
                </Link>
                <Divider
                  orientation="vertical"
                  className="h-24 md:h-28 lg:h-32"
                />
              </div>
            );
          }
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between">
              <Link href={`${POSTS}/${data._id}`}>
                <Image
                  src={FILE_URL + data.imagesUrls[0]}
                  alt={data.title}
                  classNames={{
                    wrapper:
                      "w-28 h-24 md:w-32 md:h-28 xl:w-36 object-cover xl:h-32 2xl:w-40 2xl:h-36 !max-w-40",
                    img: "w-full h-full max-h-40 object-cover",
                  }}
                />
              </Link>
              <Divider
                orientation="vertical"
                className="h-24 md:h-28 lg:h-32"
              />
            </div>
          );
        case "title":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between">
              <Link className="text-text-color" href={`${POSTS}/${data._id}`}>
                <h6 className="max-w-60 min-w-28 lg:min-w-36 text-xs lg:text-small 2xl:text-base">
                  {data.title}
                </h6>
              </Link>
              <Divider
                orientation="vertical"
                className="h-24 md:h-28 lg:h-32"
              />
            </div>
          );
        case "description":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between text-light-text">
              <p className="text-xs 2xl:text-small line-clamp-3 min-w-56 max-w-72">
                {data.description}
              </p>
              <Divider
                orientation="vertical"
                className="h-24 md:h-28 lg:h-32"
              />
            </div>
          );
        case "price":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between ">
              <p className="max-md:text-xs font-semibold min-w-16">
                {"frequencyPrice" in data
                  ? `$${data.price} por ${
                      frequencyPriceItems.find(
                        (p) => p.value === data.frequencyPrice
                      )?.text
                    }`
                  : `$${data.price}`}
              </p>
              <Divider
                orientation="vertical"
                className="h-24 md:h-28 lg:h-32"
              />
            </div>
          );
        case "reviews":
          if (!("reviews" in data)) {
            return (
              <div className={`flex gap-2 2xl:gap-4 items-center justify-end`}>
                <Divider
                  orientation="vertical"
                  className="h-24 md:h-28 lg:h-32"
                />
              </div>
            );
          }
          const averageRating =
            data.reviews.reduce((acc, review) => acc + review.rating, 0) /
            data.reviews.length;
          return (
            <div
              className={`flex gap-8 3xl:gap-4 items-center ${
                data.reviews.length > 0 ? "justify-between" : "justify-end"
              }`}
            >
              {data.reviews.length > 0 && (
                <div className="flex gap-1 items-center text-light-text max-md:text-xs ml-4 md:ml-3 text-sm">
                  <FaStar className="size-3 md:size-4" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
              )}
              <Divider
                orientation="vertical"
                className="h-24 md:h-28 lg:h-32"
              />
            </div>
          );
        case "location":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between text-light-text">
              <p className="text-xs 2xl:text-small min-w-32 max-w-52">
                {data.location.description}
              </p>
              <Divider
                orientation="vertical"
                className="h-24 md:h-28 lg:h-32"
              />
            </div>
          );

        default:
          return (
            <div className="flex gap-1 items-center">
              <ShareButton data={data} shareType="post" />
              <SaveButton post={data} />
            </div>
          );
      }
    },
    []
  );

  return (
    <Table
      isHeaderSticky
      shadow="none"
      aria-label="lista comparativa de anuncios"
      className="w-full"
      bottomContent={isLoading ? <Spinner color="warning" /> : null}
      classNames={{
        base: "w-full !overflow-x-auto max-xl:max-h-[75vh] overflow-y-auto",
        th: "bg-white pl-1",
        thead: "[&>tr]:!shadow-none",
        wrapper: "p-0",
        td: "max-h-fit max-md:p-1 pl-1",
      }}
    >
      <TableHeader className="!shadow-none">
        <TableColumn key="imagesUrls">Imagen</TableColumn>
        <TableColumn key="title">Título</TableColumn>
        <TableColumn key="description">Descripción</TableColumn>
        <TableColumn key="price">Precio</TableColumn>
        <TableColumn key="reviews">Calificación</TableColumn>
        <TableColumn key="location">Ubicación</TableColumn>
        <TableColumn key="actions">Acciones</TableColumn>
      </TableHeader>
      <TableBody
        isLoading={isLoading}
        emptyContent={`No se encontraron resultados. ${
          isSearchDone && "Por favor, intenta con otros términos de búsqueda."
        }`}
      >
        {items.map((item, index) => (
          <TableRow key={index}>
            {(columnKey: any) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PostGridList;
