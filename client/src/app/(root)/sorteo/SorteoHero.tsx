import { Image, Chip } from "@nextui-org/react";

interface Props {
    title: string;
    subtitle: string;
    badge: string;
    image: string;
}

export default function SorteoHero({ title, subtitle, badge, image }: Props) {
    return (
        <section className="w-full relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-10">
                {/* Texto */}
                <div className="flex flex-col gap-3 lg:w-1/2 text-white z-10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        GRAN SORTEO
                    </span>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-300">{subtitle}</p>
                    <Chip
                        className="mt-2 w-fit text-xs font-semibold"
                        color="warning"
                        variant="flat"
                    >
                        {badge}
                    </Chip>
                </div>

                {/* Imagen */}
                <div className="lg:w-1/2 flex justify-center">
                    <Image
                        src={image}
                        alt="Premio del sorteo"
                        className="object-contain max-h-[300px] lg:max-h-[400px]"
                        removeWrapper
                    />
                </div>
            </div>
        </section>
    );
}
