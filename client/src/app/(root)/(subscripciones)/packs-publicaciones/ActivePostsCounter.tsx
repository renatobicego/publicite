"use client";

import useUserPostLimit from "@/utils/hooks/useUserPostLimit";

const ActivePostsCounter = () => {
  const { limit, numberOfPosts } = useUserPostLimit();
  return (
    <p className="text-tiny md:text-small text-light-text">
      Estás utilizando {numberOfPosts.agenda} de tus {limit.agenda}{" "}
      publicaciones de Agenda activas disponibles. <br /> Estás utilizando{" "}
      {numberOfPosts.libre} de tus {limit.libre} publicaciones Libre activas
      disponibles.
    </p>
  );
};

export default ActivePostsCounter;
