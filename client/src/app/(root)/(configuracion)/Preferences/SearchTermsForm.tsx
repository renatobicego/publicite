import { use, useEffect, useState } from "react";
import FormCard from "../FormCard";
import { Button, Select, Selection, SelectItem } from "@nextui-org/react";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import { PostCategory } from "@/types/postTypes";
import { getCategories } from "@/services/postsServices";
import { changeUserPreferences } from "@/services/userServices";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useDispatch } from "react-redux";
import { useConfigData } from "../../providers/userDataProvider";

const SearchTermsForm = ({
  setIsFormVisible,
  prevValues,
}: {
  setIsFormVisible: (value: boolean) => void;
  prevValues: PostCategory[];
}) => {
  const [values, setValues] = useState<Selection>(
    new Set(prevValues.map((c) => c._id))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<PostCategory[]>();
  const { updateSearchTerms } = useConfigData();
  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newValues = Array.from(values) as string[];
    const res = await changeUserPreferences({
      searchPreference: newValues,
    });
    if (res.error) {
      setIsSubmitting(false);
      toastifyError(res.error);
      return;
    }
    updateSearchTerms(
      categories?.filter((category) =>
        newValues.includes(category._id) ? category : null
      ) as PostCategory[]
    );
    setIsSubmitting(false);
    toastifySuccess("Preferencias guardadas");
    setIsFormVisible(false);
  };
  return (
    <FormCard
      title="Preferencias de búsqueda"
      cardBodyClassname="flex gap-4 flec-col"
    >
      <Select
        label="Intereses"
        placeholder="Seleccione una o más categorías"
        selectionMode="multiple"
        className="max-w-full"
        scrollShadowProps={{
          hideScrollBar: false,
        }}
        classNames={{
          trigger: "shadow-none hover:shadow-sm border-[0.5px]",
          value: "text-[0.8125rem]",
          label: "font-medium text-[0.8125rem]",
        }}
        radius="full"
        variant="bordered"
        labelPlacement="outside"
        isLoading={categories === undefined}
        selectedKeys={values}
        onSelectionChange={setValues}
        items={categories ?? []}
      >
        {(category) => (
          <SelectItem key={category._id}>{category.label}</SelectItem>
        )}
      </Select>
      <div className="flex gap-2 w-full justify-end">
        <Button
          color="default"
          variant="light"
          radius="full"
          onPress={() => setIsFormVisible(false)}
        >
          Cancelar
        </Button>
        <PrimaryButton
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          type="submit"
          onPress={handleSubmit}
        >
          Actualizar
        </PrimaryButton>
      </div>
    </FormCard>
  );
};

export default SearchTermsForm;
