import { Button } from "@nextui-org/react";
import React from "react";
import { FaCheck } from "react-icons/fa";
import { FaX, FaPencil } from "react-icons/fa6";
import SecondaryButton from "../buttons/SecondaryButton";
import { Field, Form, Formik, FormikHelpers } from "formik";
import { CustomTextarea } from "../inputs/CustomInputs";
import { editNoteGroup } from "@/app/server/groupActions";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";

interface GroupNoteFormProps {
  prevNote: string;
  groupId: string;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  setNote: React.Dispatch<React.SetStateAction<string | undefined>>;
}
interface GroupNoteFormValues {
  groupNote: string;
}
const GroupNoteForm = ({
  prevNote,
  groupId,
  setShowForm,
  setNote,
}: GroupNoteFormProps) => {
  const initialValues: GroupNoteFormValues = { groupNote: prevNote };
  const onSubmit = async (
    values: GroupNoteFormValues,
    actions: FormikHelpers<GroupNoteFormValues>
  ) => {
    if (values.groupNote === prevNote || !values.groupNote) {
      actions.setFieldError("groupNote", "Por favor ingresa una nota");
      actions.setSubmitting(false);
      return;
    }
    const res = await editNoteGroup({
      _id: groupId,
      groupNote: values.groupNote,
    });
    if ("error" in res) {
      actions.setSubmitting(false);
      toastifyError(res.error);
      return;
    }
    toastifySuccess(res.message);
    setShowForm(false);
    setNote(values.groupNote);
  };
  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ isSubmitting, errors }) => (
        <Form className="flex flex-col gap-2 items-end">
          <Field
            as={CustomTextarea}
            isInvalid={errors.groupNote}
            errorMessage={errors.groupNote}
            name="groupNote"
            label="Nota"
            id="groupNote"
            isI
            className="w-full"
            placeholder="Agregue una nota"
          />
          <menu className="flex gap-2 items-center justify-end">
            <Button
              isIconOnly
              radius="full"
              color="danger"
              variant="flat"
              aria-label="cancelar edición"
              onPress={() => setShowForm(false)}
              className="p-1"
              isDisabled={isSubmitting}
            >
              <FaX className="size-3" />
            </Button>
            <SecondaryButton
              isIconOnly
              type="submit"
              aria-label="aceptar cambios"
              onPress={() => setShowForm(true)}
              className="p-1"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              <FaCheck className="size-4" />
            </SecondaryButton>
          </menu>
        </Form>
      )}
    </Formik>
  );
};

export default GroupNoteForm;
