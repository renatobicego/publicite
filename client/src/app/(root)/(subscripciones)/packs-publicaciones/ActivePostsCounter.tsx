"use client";

import useUserPostLimit from "@/utils/hooks/useUserPostLimit";
import { formatPaymentDate } from "@/utils/functions/packs";

const ActivePostsCounter = () => {
  const { limit, numberOfPosts, carryover } = useUserPostLimit();
  const carryoverDate = formatPaymentDate(carryover?.until);
  return (
    <p className="text-tiny md:text-small text-light-text text-center">
      Estás usando {numberOfPosts.agenda} de tus {limit.agenda} anuncios de
      agenda activos. <br /> Estás usando {numberOfPosts.libre} de tus{" "}
      {limit.libre} anuncios geolocalizados activos.
      {carryover && carryoverDate && (
        <>
          <br />
          Por tu cambio de plan, el {carryoverDate} tu límite pasa a{" "}
          {carryover.agenda} anuncios de agenda y {carryover.libre}{" "}
          geolocalizados.
        </>
      )}
    </p>
  );
};

export default ActivePostsCounter;
