"use client";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";
import { useState } from "react";
import SecondaryButton from "../buttons/SecondaryButton";
import { FaCheck, FaPencil, FaX } from "react-icons/fa6";
import GroupNoteForm from "./GroupNoteForm";

const GroupNote = ({
  groupNote,
  isAdmin,
  groupId,
}: {
  groupNote?: string;
  isAdmin: boolean;
  groupId: string;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [note, setNote] = useState(groupNote);
  return (
    <Card
      shadow="sm"
      id="group-note"
      className="lg:float-right w-full md:w-1/2 lg:w-2/5 lg:p-6 xl:w-1/3 p-4 flex flex-col gap-2"
    >
      <CardHeader className="p-0">
        {" "}
        <h6>Nota de Grupo</h6>
      </CardHeader>
      <CardBody className="p-0">
        {showForm && isAdmin ? (
          <GroupNoteForm
            groupId={groupId}
            setShowForm={setShowForm}
            prevNote={note || ""}
            setNote={setNote}
          />
        ) : (
          <p
            className={`${
              note ? "" : "italic"
            } text-sm md:text-small xl:text-base`}
          >
            {note || "Este grupo no tiene una nota"}
          </p>
        )}
      </CardBody>
      {isAdmin && !showForm && (
        <CardFooter className="p-0 justify-end">
          <SecondaryButton
            isIconOnly
            onPress={() => setShowForm(true)}
            className="p-1"
          >
            <FaPencil className="size-4" />
          </SecondaryButton>
        </CardFooter>
      )}
    </Card>
  );
};

export default GroupNote;
