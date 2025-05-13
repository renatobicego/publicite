"use client";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import React from "react";

const TermsConditions = ({
  showCheckbox = false,
  checkboxAccept,
  setCheckboxAccept,
}: {
  showCheckbox?: boolean;
  checkboxAccept?: boolean;
  setCheckboxAccept?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      {showCheckbox ? (
        <div className="flex items-center gap-1">
          <Checkbox
            size="sm"
            isSelected={checkboxAccept}
            onValueChange={setCheckboxAccept}
          >
            Acepto los
          </Checkbox>
          <Button
            onPress={onOpen}
            radius="full"
            variant="light"
            color="primary"
            className="-ml-4 mt-[1px] data-[hover=true]:bg-transparent"
          >
            términos y condiciones
          </Button>
        </div>
      ) : (
        <Button
          onPress={onOpen}
          radius="full"
          variant="light"
          className="text-white -ml-4 -mt-1.5 data-[hover=true]:bg-transparent"
        >
          Términos y Condiciones
        </Button>
      )}
      <Modal
        size="xl"
        placement="center"
        scrollBehavior="inside"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          wrapper: "z-[100000000]",
          backdrop: "z-[100000000]",
        }}
      >
        <ModalContent>
          <ModalHeader>Términos y condiciones</ModalHeader>
          <ModalBody>
            <h5>Introducción</h5>
            <p>
              Bienvenido a Publicite, una plataforma de publicidad en línea. Al
              utilizar nuestros servicios, aceptas estos Términos y Condiciones.
            </p>

            <h5>Protección de Datos Personales</h5>
            <p>
              Nos comprometemos a proteger la privacidad y seguridad de tus
              datos personales. Los datos que nos proporciones serán utilizados
              exclusivamente para los fines de la plataforma y no serán
              compartidos con terceros sin tu consentimiento explícito.
            </p>

            <h5>Uso de Cookies</h5>
            <p>
              Nuestra plataforma utiliza cookies para mejorar tu experiencia de
              navegación y para recopilar información estadística. Puedes
              configurar tu navegador para rechazar las cookies, pero esto puede
              afectar la funcionalidad de la plataforma.
            </p>

            <h5>Responsabilidad del Usuario</h5>
            <p>
              Eres responsable de la información que publiques, compartas o
              recibas en nuestra plataforma. Te comprometes a:
            </p>
            <ul className="list-inside list-disc">
              <li>
                No publicar contenido que sea ilegal, ofensivo, discriminatorio
                o que viole los derechos de terceros.
              </li>
              <li>
                No compartir información personal o confidencial sin el
                consentimiento explícito de la persona afectada.
              </li>
              <li>Responsabilizarte por quienes te contactan.</li>
            </ul>
            <p>
              El uso de la localización es responsabilidad del usuario, siendo
              la localización predeterminada la actual del usuario. Su
              modificación y configuración depende de los usuarios
              exclusivamente.
            </p>

            <h5>Propiedad Intelectual</h5>
            <p>
              Todos los contenidos de la plataforma, incluyendo textos, imágenes
              y logos, son propiedad intelectual de Publicite o de terceros que
              nos han autorizado su uso. No puedes utilizar, copiar o distribuir
              estos contenidos sin nuestra autorización previa.
            </p>

            <h5>Limitación de Responsabilidad</h5>
            <p>
              No seremos responsables por cualquier daño o pérdida que sufras
              como resultado del uso de la plataforma, incluyendo pero no
              limitado a:
            </p>
            <ul className="list-inside list-disc">
              <li>
                Daños o pérdidas causados por la publicación de contenido
                inapropiado o ilegal.
              </li>
              <li>
                Daños o pérdidas causados por la violación de los derechos de
                propiedad intelectual.
              </li>
              <li>
                Daños o pérdidas causados por la interrupción o suspensión de la
                plataforma.
              </li>
            </ul>

            <h5>Cambios en los Términos y Condiciones</h5>
            <p>
              Podemos modificar estos Términos y Condiciones en cualquier
              momento sin previo aviso. Es tu responsabilidad revisar
              periódicamente estos Términos y Condiciones para estar al tanto de
              cualquier cambio.
            </p>

            <h5>Aceptación</h5>
            <p>
              Al utilizar nuestra plataforma, aceptas estos Términos y
              Condiciones. Si no estás de acuerdo con estos Términos y
              Condiciones, no puedes utilizar nuestra plataforma.
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TermsConditions;
