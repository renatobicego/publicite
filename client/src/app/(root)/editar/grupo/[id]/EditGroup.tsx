"use client";
import Inputs from "@/app/(root)/crear/grupo/Inputs";
import UploadProfileImage from "@/app/(root)/crear/grupo/UploadProfileImage";
import { groupValidation } from "@/app/(root)/crear/grupo/validation";
import PrimaryButton from "@/components/buttons/PrimaryButton";
import RequiredFieldsMsg from "@/components/chips/RequiredFieldsMsg";
import { Group } from "@/types/userTypes";
import useUploadImage from "@/utils/hooks/useUploadImage";
import { Form, Formik } from "formik";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";

const EditGroup = ({ groupData }: { groupData: Group }) => {
  const initialValues: Group = {
    _id: groupData._id,
    name: groupData.name,
    admins: groupData.admins,
    details: groupData.details,
    rules: groupData.rules,
    magazines: groupData.magazines,
    members: groupData.members,
    profilePhotoUrl: groupData.profilePhotoUrl,
    visibility: groupData.visibility,
  };
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File>();
  const { submitFiles, progress, deleteFile } = useUploadImage();

  const handleSubmit = async (
    values: Group,
    actions: any) => {
      
    }
  

  return <Formik
  validateOnBlur={false}
  validateOnChange={false}
  initialValues={initialValues}
  onSubmit={handleSubmit}
  validationSchema={groupValidation}
>
  {({ isSubmitting, errors, setFieldValue, values }) => {
    return (
      <Form className="flex gap-8 max-md:flex-col w-full lg:w-5/6 xl:w-3/4 self-center">
        <UploadProfileImage
          photoFile={photoFile}
          setPhotoFile={setPhotoFile}
          prevImage={values.profilePhotoUrl}
          setFieldValue={setFieldValue}
        />
        <div className="flex flex-col gap-4 w-full">
          <h2>Editar Grupo</h2>
          <Inputs setFieldValue={setFieldValue} errors={errors} showMembers={false} id={groupData._id}/>
          <RequiredFieldsMsg />
          <PrimaryButton
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
            type="submit"
            className="self-start"
          >
            {isSubmitting
              ? photoFile
                ? `Editando ${progress}%`
                : "Editando"
              : "Crear Grupo"}
          </PrimaryButton>
          {Object.keys(errors).length > 0 && (
            <p className="text-danger text-sm">
              Por favor corrija los errores
            </p>
          )}
        </div>
      </Form>
    );
  }}
</Formik>;
};

export default EditGroup;
