import { Good } from "@/types/postTypes"

const AdditionalGoodData = ({post} : {post: Good}) => {
  return (
    <ul className="flex flex-col gap-1 list-disc list-inside ml-2 text-sm xl:text-base">
      {post.year && <li>Año: {post.year}</li>}
      {post.brand && <li>Marca: {post.brand}</li>}
      {post.modelType && <li>Modelo: {post.modelType}</li>}
    </ul>
  )
}

export default AdditionalGoodData