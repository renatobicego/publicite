import { FRIEND_PLAN_INFO, GIFT_PLAN } from "@/utils/data/urls";
import Link from "next/link";
import { ReactNode } from "react";
import { FaArrowRight, FaGift, FaUserGroup } from "react-icons/fa6";

// Otras formas de tener un plan: Hacete Amigo y Regalar. Van arriba de los planes
// para que se vean antes de elegir uno.

const ShortcutCard = ({
  href,
  icon,
  title,
  badge,
  description,
  cta,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  badge?: string;
  description: string;
  cta: string;
}) => (
  <Link
    href={href}
    className="group flex gap-3 items-start rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-primary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg">
      {icon}
    </span>
    <span className="flex flex-col gap-1 min-w-0">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-text-color">{title}</span>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {badge}
          </span>
        )}
      </span>
      <span className="text-sm text-light-text">{description}</span>
      <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary">
        {cta}
        <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
      </span>
    </span>
  </Link>
);

export default function PlanShortcuts({
  maxFriendDiscount,
}: {
  /** Mayor descuento de Hacete Amigo; 0 si no se pudo leer (no se muestra). */
  maxFriendDiscount: number;
}) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <ShortcutCard
        href={FRIEND_PLAN_INFO}
        icon={<FaUserGroup />}
        title="Hacete Amigo"
        badge={maxFriendDiscount > 0 ? `hasta ${maxFriendDiscount}% off` : undefined}
        description="Armá un grupo: uno paga por todos y cada uno tiene su plan."
        cta="Armar mi grupo"
      />
      <ShortcutCard
        href={GIFT_PLAN}
        icon={<FaGift />}
        title="Regalá un plan"
        badge="Pago único"
        description="Elegí el plan y los meses; le llega a su cuenta o a su email."
        cta="Regalar"
      />
    </div>
  );
}
