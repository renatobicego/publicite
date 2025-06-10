"use client";
import { GetUser } from "@/types/userTypes";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import PrimaryButton from "../../buttons/PrimaryButton";
import { Form, Formik, FormikHelpers } from "formik";
import { Board, PostBoard } from "@/types/board";
import { Dispatch, SetStateAction, useState } from "react";
import CreateBoardInputs from "./CreateBoardInputs";
import BoardColor from "../inputs/BoardColor";
import { toastifyError, toastifySuccess } from "@/utils/functions/toastify";
import { createBoard, editBoard } from "@/app/server/boardActions";
import { handleBoardColor } from "@/utils/functions/utils";

const CreateBoard = ({
  user,
  prevBoard,
  setShowEditBoard,
  setLocalBoardData,
}: {
  user: GetUser;
  prevBoard?: Board;
  setShowEditBoard?: Dispatch<SetStateAction<boolean>>;
  setLocalBoardData: Dispatch<SetStateAction<Board>>;
}) => {
  const [showForm, setShowForm] = useState(prevBoard ? true : false);
  const [bgColor, setBgColor] = useState(prevBoard?.color || "bg-fondo");
  const initialValues: PostBoard = {
    annotations: prevBoard ? prevBoard.annotations : [],
    keywords: prevBoard ? prevBoard.keywords : [],
    user: user._id,
    visibility: prevBoard ? prevBoard.visibility : "public",
    color: bgColor,
    searchTerm: `${user.username} ${user.name}`,
  };
  const { borderColor, textColor } = handleBoardColor(bgColor);
  const handleSubmit = async (
    values: PostBoard,
    actions: FormikHelpers<PostBoard>
  ) => {
    let resApi;
    if (prevBoard) {
      const editValues = {
        annotations: values.annotations,
        keywords: values.keywords,
        color: bgColor,
        visibility: values.visibility,
      };
      resApi = await editBoard(prevBoard._id, editValues);
    } else {
      resApi = await createBoard({ ...values, color: bgColor });
    }
    if (resApi.error) {
      toastifyError(resApi.error);
      actions.setSubmitting(false);
      return;
    }
    setShowForm(false);
    if (setShowEditBoard) {
      setShowEditBoard(false);
    }
    if (resApi.updatedData) setLocalBoardData(resApi.updatedData as Board);
    toastifySuccess((resApi as any).message);
  };
  return (
    <Card
      className={`p-4 flex flex-col gap-2 bg-fondo min-w-full md:min-w-[30%] lg:p-6 md:max-w-[34%] xl:max-w-[50%]
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
            {({ isSubmitting, setValues, values }) => {
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
                      onPress={() => {
                        setBgColor(prevBoard?.color || "bg-fondo");
                        setShowForm(false);
                        if (setShowEditBoard) {
                          setShowEditBoard(false);
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <PrimaryButton
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                      type="submit"
                      className="self-start"
                    >
                      {isSubmitting
                        ? prevBoard
                          ? "Editando"
                          : "Creando"
                        : prevBoard
                        ? "Editar"
                        : "Crear"}
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
      {!prevBoard && (
        <CardFooter className="flex w-full items-center justify-between p-0 pt-2">
          {!showForm && (
            <PrimaryButton onPress={() => setShowForm(true)}>
              Crear Pizarra
            </PrimaryButton>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default CreateBoard;
