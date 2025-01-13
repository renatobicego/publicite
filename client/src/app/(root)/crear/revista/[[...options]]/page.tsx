import BreadcrumbsAdmin from "@/components/BreadcrumbsAdmin";
import { CREATE, CREATE_MAGAZINE } from "@/utils/data/urls";
import CreateMagazineForm from "./CreateMagazineForm";
import PostCard from "@/components/cards/PostCard/PostCard";
import { getPostData } from "@/services/postsServices";
import ErrorCard from "@/components/ErrorCard";
import { getId, getMagazineType, getSharedMagazineIds } from "@/utils/functions/utils";
import { auth } from "@clerk/nextjs/server";

export default async function CreateMagazine(
  props: {
    params: Promise<{ options: string[] | undefined }>;
  }
) {
  const params = await props.params;
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
  // get options sent by url
  const { options } = params;
  // if url includes group, it will create a group magazine
  // if it includes compartida, it will create a shared magazine
  const { isGroupMagazine, isSharedMagazine } = getMagazineType(options);
  // if is group magazine, it will be the id of the group
  // if not, it will be the id of the post that wants to be added to the magazine. 
  // This is when you are creating a magazine from a post
  const id = getId(options, isGroupMagazine);
  // if it's a magazine that is shared, the url will be:
  // [compartida, user id, post id]
  // post id is only present if the user wants to add a post to the shared magazine
  const sharedMagazineIds = getSharedMagazineIds(options, isSharedMagazine);

  let postData = null;

  // Call getPostData only if necessary:
  // if isSharedMagazine and sharedMagazineIds?.post is present
  if (isSharedMagazine && sharedMagazineIds?.post) {
    postData = await getPostData(sharedMagazineIds.post);
  } else if (id && !isGroupMagazine && !isSharedMagazine) { // if is user magazine common and is being created also with a post
    postData = await getPostData(id);
  }

  // Handle error if postData has any issues
  if (postData && "error" in postData) {
    return <ErrorCard message={postData.error} />;
  }
  
  const userId = auth().sessionClaims?.metadata.mongoId;
  return (
    <main className="flex min-h-screen flex-col items-start main-style gap-4 md:gap-6 lg:gap-8">
      <BreadcrumbsAdmin items={breadcrumbsItems} />
      <div className="w-full flex gap-4 items-start max-md:flex-wrap">
        {postData && (
          <PostCard
            postData={postData as any}
            recommendation={false}
            interactable={false}
            className="max-w-[50vw] md:max-w-[30vw] lg:max-w-[25vw] 3xl:max-w-[20vw]"
          />
        )}
        <CreateMagazineForm
          userId={userId as string}
          isGroupMagazine={isGroupMagazine}
          id={id}
          shareMagazineIds={sharedMagazineIds}
        />
      </div>
    </main>
  );
}
