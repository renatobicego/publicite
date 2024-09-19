import { frequencyPriceItems } from "@/app/utils/data/selectData";
import { Good, Post, Service } from "@/types/postTypes";
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
  SortDescriptor,
} from "@nextui-org/react";
import { useCallback } from "react";
import { FaStar } from "react-icons/fa6";
import SaveButton from "../buttons/SaveButton";
import ShareButton from "../buttons/ShareButton";

const PostGridList = ({
  items,
  isLoading,
}: {
  items: any[];
  isLoading: boolean;
}) => {
  const renderCell = useCallback(
    (data: Good | Service, columnKey: keyof Good | keyof Service) => {
      switch (columnKey) {
        case "imagesUrls":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between">
              <Image
                src={data.imagesUrls[0]}
                alt={data.title}
                classNames={{
                  wrapper:
                    "w-28 h-24 md:w-32 lg:w-36 md:h-28 lg:h-32 xl:w-40 object-cover xl:h-36 !max-w-40",
                  img: "w-full h-full max-h-40 object-cover",
                }}
              />
              <Divider orientation="vertical" className="h-32" />
            </div>
          );
        case "title":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between">
              <h6 className="max-w-60 max-lg:min-w-28 2xl:text-base">
                {data.title}
              </h6>
              <Divider orientation="vertical" className="h-32" />
            </div>
          );
        case "description":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between text-light-text">
              <p className="max-xl:text-xs 2xl:text-sm line-clamp-3 min-w-56 max-w-72">
                {data.description}
              </p>
              <Divider orientation="vertical" className="h-32" />
            </div>
          );
        case "price":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between ">
              <p className="max-md:text-sm font-semibold min-w-16">
                {"frequencyPrice" in data
                  ? `$${data.price} por ${
                      frequencyPriceItems.find(
                        (p) => p.value === data.frequencyPrice
                      )?.text
                    }`
                  : `$${data.price}`}
              </p>
              <Divider orientation="vertical" className="h-32" />
            </div>
          );
        case "reviews":
          const averageRating =
            data.reviews.reduce((acc, review) => acc + review.rating, 0) /
            data.reviews.length;
          return (
            <div
              className={`flex gap-2 2xl:gap-4 items-center ${
                data.reviews.length > 0 ? "justify-between" : "justify-end"
              }`}
            >
              {data.reviews.length > 0 && (
                <div className="flex gap-1 items-center text-light-text text-sm">
                  <FaStar className="size-3 md:size-4" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
              )}
              <Divider orientation="vertical" className="h-32" />
            </div>
          );
        case "location":
          return (
            <div className="flex gap-2 2xl:gap-4 items-center justify-between text-light-text">
              <p className="max-xl:text-xs 2xl:text-sm min-w-28 max-w-52">
                {data.location.description}
              </p>
              <Divider orientation="vertical" className="h-32" />
            </div>
          );

        default:
          return (
            <div className="flex gap-1 items-center">
              <ShareButton post={data as Post} />
              <SaveButton post={data as Post} saved={false} />
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
      aria-label="Example table with infinite pagination"
      className="w-full"
      bottomContent={isLoading ? <Spinner color="warning" /> : null}
      classNames={{
        base: "w-full !overflow-x-auto",
        th: "bg-white",
        thead: "[&>tr]:!shadow-none",
        wrapper: "overflow-y-hidden p-0",
        td: "max-h-fit",
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
        loadingContent={<Spinner color="white" />}
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
