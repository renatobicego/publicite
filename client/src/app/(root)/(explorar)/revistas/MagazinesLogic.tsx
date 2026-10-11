"use client";
import { Link } from "@nextui-org/react";
import { FaPlus } from "react-icons/fa6";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import MagazinesGrid from "@/components/grids/MagazinesGrid";
import { useMagazinesData } from "@/app/(root)/providers/userDataProvider";
import { CREATE_MAGAZINE } from "@/utils/data/urls";

// Revistas del usuario logueado (propias y en las que colabora). Salen del
// store, que las carga al iniciar sesión (DataInitializer).
const MagazinesLogic = () => {
  const { magazines } = useMagazinesData();

  return (
    <section className="w-full flex-col flex gap-4">
      <h2>Revistas</h2>
      <PrimaryButton
        className="md:self-start"
        startContent={<FaPlus />}
        as={Link}
        href={CREATE_MAGAZINE}
      >
        Crear Revista
      </PrimaryButton>
      <MagazinesGrid
        magazines={magazines ?? []}
        isLoading={magazines === undefined}
      />
    </section>
  );
};

export default MagazinesLogic;
