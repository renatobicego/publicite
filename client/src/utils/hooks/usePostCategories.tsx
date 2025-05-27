"use client"
import { getCategories } from "@/services/postsServices";
import { PostCategory } from "@/types/postTypes";
import { useEffect, useState } from "react";
import { toastifyError } from "../functions/toastify";

const usePostCategories = () => {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  useEffect(() => {
    getCategories().then((data) => {
      if (data.error) {
        toastifyError(data.error);
        return;
      }
      setCategories(data);
    });
  }, []);

  return { categories, setCategories };
};

export default usePostCategories;
