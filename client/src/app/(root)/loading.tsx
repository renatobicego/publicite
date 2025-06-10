import { Spinner } from "@nextui-org/react";

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
      <div aria-label="Cargando" className="min-h-screen flex justify-center items-center w-full">
        <Spinner color="warning" />
      </div>
    );
  }