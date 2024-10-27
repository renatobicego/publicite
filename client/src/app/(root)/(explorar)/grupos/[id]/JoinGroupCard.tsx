"use client";

import { GROUPS } from "@/utils/data/urls";
import { useRouter } from "next-nprogress-bar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FaLock } from "react-icons/fa6";

const JoinGroupCard = ({
  groupId,
}: {
  groupId: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (
      pathname.includes("miembros") ||
      pathname.includes("solicitudes")
    ) {
      router.replace(`${GROUPS}/${groupId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full mt-8">
      <FaLock className="size-10 min-w-10 text-light-text" />
      <p className="text-center text-light-text text-small md:text-base">
        No eres miembro de este grupo. ¡Únete para acceder a su contenido!
      </p>
    </div>
  );
};

export default JoinGroupCard;
