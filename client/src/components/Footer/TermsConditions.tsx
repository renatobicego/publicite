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

// Texto legal redactado sin revisión de un abogado: revisarlo antes de
// considerarlo definitivo. Al cambiarlo, actualizar la fecha.
const TERMS_UPDATED_AT = "9 de noviembre de 2026";

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-outside list-disc pl-5 flex flex-col gap-1">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

const TERMS_SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "introduccion",
    title: "Introducción y aceptación",
    body: (
      <>
        <p>
          Bienvenido a Soonpublicité («Soon», «la plataforma»), un ecosistema de
          aplicaciones para publicar anuncios, producciones propias y vincularte
          con otras personas. Al registrarte o usar la plataforma aceptás estos
          Términos y Condiciones. Si no estás de acuerdo, no uses la
          plataforma.
        </p>
      </>
    ),
  },
  {
    id: "cuenta",
    title: "Tu cuenta",
    body: (
      <List
        items={[
          "Los datos que cargues al registrarte tienen que ser reales y estar actualizados.",
          "Sos responsable de cuidar el acceso a tu cuenta y de todo lo que se haga desde ella.",
          "Podemos suspender o dar de baja cuentas que incumplan estos términos.",
        ]}
      />
    ),
  },
  {
    id: "contenido",
    title: "Tu contenido y tu responsabilidad",
    body: (
      <>
        <p>
          Sos responsable de todo lo que publiques, compartas, envíes o recibas
          en la plataforma: anuncios, blogs, archivos, artículos, comentarios,
          reseñas, mensajes y cualquier otro contenido. Te comprometés a:
        </p>
        <List
          items={[
            "No publicar contenido ilegal, ofensivo, discriminatorio, engañoso o que viole derechos de terceros (incluidos derechos de autor e imagen).",
            "No compartir información personal o confidencial de otras personas sin su consentimiento.",
            "Responsabilizarte por los contactos y acuerdos que hagas con otros usuarios.",
          ]}
        />
        <p>
          Al publicar contenido conservás tus derechos sobre él y nos autorizás
          a mostrarlo y almacenarlo dentro de la plataforma según el alcance
          que elijas.
        </p>
      </>
    ),
  },
  {
    id: "anuncios",
    title: "Anuncios",
    body: (
      <>
        <p>
          Los anuncios pueden ser geolocalizados (públicos, visibles para
          quien esté dentro del alcance de su ubicación) o de agenda (visibles
          sólo para tus contactos). El uso de la ubicación es responsabilidad
          del usuario: la ubicación predeterminada es la actual, y modificarla
          o configurarla depende exclusivamente de vos.
        </p>
        <p>
          Soon no es parte de las operaciones entre usuarios: no verifica los
          bienes o servicios ofrecidos, no garantiza su calidad, precio ni
          disponibilidad y no interviene en los pagos entre las partes.
        </p>
      </>
    ),
  },
  {
    id: "blog",
    title: "Blog (Mis Producciones)",
    body: (
      <>
        <p>
          En Mis Producciones podés crear blogs, personales o de un grupo, y
          publicar fotos, videos, audios, documentos, artículos y
          recomendaciones.
        </p>
        <List
          items={[
            "Sos responsable de tener los derechos sobre todo lo que subas a tu blog. En un blog de grupo responden el creador y los administradores del grupo.",
            "El alcance, la clave de acceso, las fechas de vigencia y los tickets los configurás vos. Lo que marques como «Sólo yo» no se muestra a otros usuarios.",
            "Tickets pagos: el comprador transfiere el precio directamente a la cuenta del blog y, aparte, la comisión de Soon. Soon no recibe, retiene ni liquida el dinero del blog. Habilitar o rechazar cada compra es responsabilidad del blog. Si la comisión no se paga, el acceso puede quedar suspendido hasta que se regularice.",
            "Las reseñas y comentarios son de quienes los escriben. Cualquier usuario puede denunciar contenido; Soon puede ocultar o bloquear lo que incumpla estos términos. Los datos de quien denuncia no se comparten con el blog.",
            "El espacio de almacenamiento y la cantidad de blogs y archivos dependen de tu plan.",
          ]}
        />
      </>
    ),
  },
  {
    id: "tablero",
    title: "Tablero de trabajo y Cubito (inteligencia artificial)",
    body: (
      <>
        <p>
          Cubito y el Tablero de trabajo usan inteligencia artificial para
          conversar, generar y editar imágenes, valuar objetos o servicios
          (Valuación IA) y buscar anuncios relacionados (Match IA).
        </p>
        <List
          items={[
            "Las respuestas, imágenes, valuaciones y resultados generados con IA pueden ser inexactos, incompletos o no estar actualizados. Son orientativos: una valuación no es una tasación profesional.",
            "Revisá lo que generes antes de usarlo, publicarlo o compartirlo. Las decisiones que tomes en base a ese contenido son tuyas.",
            "No uses la IA para crear contenido ilegal, engañoso, que imite a personas reales o que viole derechos de terceros.",
            "Tus conversaciones se guardan para que puedas retomarlas desde el historial; podés borrarlas cuando quieras.",
            "El uso de la IA consume tokens según tu plan, con los límites que correspondan.",
          ]}
        />
      </>
    ),
  },
  {
    id: "ia",
    title: "Contenido generado con IA: responsabilidad",
    body: (
      <p>
        <strong>
          Soon no se hace responsable del contenido generado con inteligencia
          artificial.
        </strong>{" "}
        El usuario que lo genera es el único responsable de su uso, publicación
        y difusión, y de que no infrinja derechos de terceros ni la ley. Esto
        incluye el contenido generado en Cubito y en el Tablero de trabajo que
        después se publique en anuncios, blogs u otras secciones.
      </p>
    ),
  },
  {
    id: "pagos",
    title: "Planes y pagos",
    body: (
      <p>
        Las suscripciones y los packs se pagan por Mercado Pago y definen los
        límites de tu cuenta (anuncios, contactos, blogs, almacenamiento y uso
        de IA). Si bajás de plan, parte de tu contenido puede quedar inactivo
        hasta que vuelva a entrar en los límites.
      </p>
    ),
  },
  {
    id: "datos",
    title: "Datos personales y cookies",
    body: (
      <>
        <p>
          Nos comprometemos a proteger la privacidad y seguridad de tus datos
          personales. Los usamos sólo para los fines de la plataforma y no los
          compartimos con terceros sin tu consentimiento, salvo los proveedores
          necesarios para prestar el servicio (por ejemplo, autenticación,
          almacenamiento de archivos, pagos e inteligencia artificial).
        </p>
        <p>
          Usamos cookies para mejorar tu experiencia y recopilar información
          estadística. Podés configurar tu navegador para rechazarlas, aunque
          esto puede afectar el funcionamiento de la plataforma.
        </p>
      </>
    ),
  },
  {
    id: "propiedad",
    title: "Propiedad intelectual",
    body: (
      <p>
        La marca, los logos, el diseño y el software de la plataforma son de
        Soon o de terceros que autorizaron su uso. No podés copiarlos ni
        distribuirlos sin autorización. El contenido de cada usuario es de
        quien lo publica.
      </p>
    ),
  },
  {
    id: "limitacion",
    title: "Limitación de responsabilidad",
    body: (
      <>
        <p>
          Soon no es responsable por daños o pérdidas que sufras por el uso de
          la plataforma, entre otros:
        </p>
        <List
          items={[
            "Los causados por contenido publicado o generado por usuarios, incluido el generado con IA.",
            "Los causados por la violación de derechos de propiedad intelectual por parte de usuarios.",
            "Los derivados de operaciones, pagos o acuerdos entre usuarios, incluidos los tickets de los blogs.",
            "Los causados por interrupciones, suspensiones o pérdida de datos de la plataforma.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cambios",
    title: "Cambios en estos términos",
    body: (
      <p>
        Podemos modificar estos Términos y Condiciones. La fecha de la última
        actualización figura arriba; seguir usando la plataforma después de un
        cambio implica que lo aceptás.
      </p>
    ),
  },
];

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
          className="text-white -ml-4 -my-2 data-[hover=true]:bg-transparent"
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
          <ModalHeader className="flex flex-col gap-1">
            Términos y condiciones
            <span className="text-xs font-normal text-default-500">
              Última actualización: {TERMS_UPDATED_AT}
            </span>
          </ModalHeader>
          <ModalBody className="gap-4 pb-6">
            {/* Índice */}
            <nav aria-label="Secciones" className="rounded-lg bg-default-100 p-3">
              <ol className="list-inside list-decimal text-sm columns-1 sm:columns-2 gap-4">
                {TERMS_SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a href={`#terminos-${section.id}`} className="text-primary hover:underline">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            {TERMS_SECTIONS.map((section, index) => (
              <section key={section.id} id={`terminos-${section.id}`} className="flex flex-col gap-2 text-sm">
                <h5 className="text-base font-semibold">
                  {index + 1}. {section.title}
                </h5>
                {section.body}
              </section>
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TermsConditions;
