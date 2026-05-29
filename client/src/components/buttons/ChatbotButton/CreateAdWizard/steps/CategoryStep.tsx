"use client";
import { Select, SelectItem } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/postsServices";
import { PostCategory } from "@/types/postTypes";
import { toastifyError } from "@/utils/functions/toastify";

interface CategoryStepProps {
    onSelect: (categoryId: string, categoryLabel: string) => void;
}

const CategoryStep = ({ onSelect }: CategoryStepProps) => {
    const [categories, setCategories] = useState<PostCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories().then((data) => {
            if (data.error) {
                toastifyError(data.error);
                setLoading(false);
                return;
            }
            setCategories(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="mt-2">
            <Select
                size="sm"
                variant="bordered"
                radius="lg"
                label="Categoría"
                placeholder="Seleccioná una categoría"
                isLoading={loading}
                onChange={(e) => {
                    const selected = categories.find((c) => c._id === e.target.value);
                    if (selected) {
                        onSelect(selected._id, selected.label);
                    }
                }}
            >
                {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                        {cat.label}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
};

export default CategoryStep;
