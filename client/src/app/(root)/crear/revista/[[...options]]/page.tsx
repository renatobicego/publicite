import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { CREATE, CREATE_MAGAZINE } from "@/utils/data/urls";
import CreateMagazineForm from "./CreateMagazineForm";
import PostCard from "@/components/cards/PostCard/PostCard";
import { getPostData } from "@/services/postsServices";
import ErrorCard from "@/components/ErrorCard";

export default async function CreateMagazine({
  params,
}: {
  params: { options: string[] };
}) {
  const breadcrumbsItems = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Crear",
      href: CREATE,
    },
    {
      label: "Revista",
      href: CREATE_MAGAZINE,
    },
  ];
  const { options } = params;
  const isGroupMagazine = options && options.includes("grupos");
  const id = isGroupMagazine ? options[1] : options ? options[0] : null;
  const postData = id && !isGroupMagazine && (await getPostData(id));
  if (postData && "error" in postData) {
    return <ErrorCard message={postData.error} />;
  }
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="w-full flex gap-4 items-start max-md:flex-wrap">
        {id && !isGroupMagazine && (
          <PostCard
            postData={postData as any}
            recommendation={false}
            savePostMagazine
            className="max-w-[50vw] md:max-w-[30vw] lg:max-w-[25vw] 3xl:max-w-[20vw]"
          />
        )}
        <CreateMagazineForm isGroupMagazine={isGroupMagazine} id={id} />
      </div>
    </main>
  );
}
