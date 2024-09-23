import { Magazine } from "@/types/postTypes";
import { Spinner } from "@nextui-org/react";
import MagazineCard from "../cards/MagazineCard";

const MagazinesGrid = ({
  magazines,
  isLoading = false,
  username,
}: {
  magazines: Magazine[];
  isLoading?: boolean;
  username: string;
}) => {
  return (
    <>
      <section
        className={`grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 lg:gap-5 w-full`}
      >
        {magazines.map((magazine, index) => (
          <MagazineCard
            key={magazine._id + index}
            magazineData={magazine}
            username={username}
          />
        ))}
      </section>
      {!isLoading && magazines.length === 0 && (
        <p className="max-md:text-sm text-light-text">
          No se encontraron anuncios para mostrar
        </p>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default MagazinesGrid;
