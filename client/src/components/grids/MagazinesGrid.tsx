import { Magazine } from "@/types/postTypes";
import { Spinner } from "@nextui-org/react";
import MagazineCard from "../cards/MagazineCard";

const MagazinesGrid = ({
  magazines,
  isLoading = false,
}: {
  magazines: Magazine[];
  isLoading?: boolean;
}) => {
  return (
    <>
      {!isLoading && ( !magazines || magazines.length === 0) ? (
        <p className="max-md:text-sm text-light-text">
          No se encontraron revistas para mostrar
        </p>
      ) : (
        <section
          className={`grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 lg:gap-5 w-full`}
        >
          {magazines.map((magazine, index) => (
            <MagazineCard key={magazine._id + index} magazineData={magazine} />
          ))}
        </section>
      )}
      {isLoading && <Spinner color="warning" />}
    </>
  );
};

export default MagazinesGrid;
