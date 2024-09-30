"use client";
import { GetUser } from "@/types/userTypes";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import PrimaryButton from "../buttons/PrimaryButton";
import { Form, Formik, FormikHelpers } from "formik";
import { PostBoard } from "@/types/board";
import { useState } from "react";
import CreateBoardInputs from "./CreateBoardInputs";
import BoardColor from "./inputs/BoardColor";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { useRouter } from "next-nprogress-bar";
import { createBoard } from "@/app/server/boardActions";

const CreateBoard = ({ user }: { user: GetUser }) => {
  const [showForm, setShowForm] = useState(false);
  const [bgColor, setBgColor] = useState("bg-fondo");
  const router = useRouter()
  const initialValues: PostBoard = {
    annotations: [],
    keywords: [],
    user: user._id,
    visibility: "public",
    color: bgColor,
  };
  const darkColors = ["bg-[#5A0001]/80"];
  const darkColorsBorder = [
    "bg-[#5A0001]/80",
    "bg-[#20A4F3]/30",
    "bg-[#FFB238]/80",
  ];
  const textColor = darkColors.includes(bgColor)
    ? "text-white"
    : "text-text-color";
  const borderColor = darkColorsBorder.includes(bgColor) ? "border-white" : "";
  const handleSubmit = async (
    values: PostBoard,
    actions: FormikHelpers<PostBoard>
  ) => {
    const resApi = await createBoard(values);
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    setShowForm(false)
    toastifySuccess(resApi.message as string);
    router.refresh();
  };
  return (
    <Card
      className={`p-4 flex flex-col gap-2 bg-fondo min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]
        ${bgColor} ${borderColor} ${textColor} `}
    >
      <CardHeader className="p-0">
        <h6>Pizarra de {user.username}</h6>
      </CardHeader>
      <CardBody className="p-0">
        {showForm ? (
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validateOnBlur={false}
            validateOnChange={false}
          >
            {({ errors, isSubmitting, setValues, values }) => {
              return (
                <Form className="flex flex-col gap-4">
                  <CreateBoardInputs
                    setValues={setValues}
                    values={values}
                    borderColor={borderColor}
                    textColor={textColor}
                  />
                  <div className="flex flex-col gap-1">
                    <h6 className="text-small">Color de Pizarra</h6>
                    <BoardColor
                      colorSelected={bgColor}
                      setColorSelected={setBgColor}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button
                      color="danger"
                      variant="light"
                      radius="full"
                      onPress={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                    <PrimaryButton
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                      type="submit"
                      className="self-start"
                    >
                      {isSubmitting ? "Creando" : "Crear"}
                    </PrimaryButton>
                  </div>
                </Form>
              );
            }}
          </Formik>
        ) : (
          <></>
        )}
      </CardBody>
      <CardFooter className="flex w-full items-center justify-between p-0 pt-2">
        {!showForm && (
          <PrimaryButton onPress={() => setShowForm(true)}>
            Crear Pizarra
          </PrimaryButton>
        )}
      </CardFooter>
    </Card>
  );
};

export default CreateBoard;
