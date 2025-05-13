import {
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import PrimaryButton from "../PrimaryButton";
import { cloneElement, isValidElement } from "react";

// Define a type for elements that can have onClick/onPress handlers
type ButtonLikeElement = React.ReactElement<{
  onClick?: (e: React.MouseEvent) => void;
  onPress?: (e: any) => void;
}>;

const GlosaryModal = ({ customButton }: { customButton?: React.ReactNode }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const renderButton = () => {
    if (customButton && isValidElement(customButton)) {
      // Type assertion to tell TypeScript this element has onClick/onPress props
      const buttonElement = customButton as ButtonLikeElement;

      return cloneElement(buttonElement, {
        onClick: () => onOpen(),
      });
    }

    // Default button
    return (
      <PrimaryButton
        onPress={onOpen}
        variant="light"
        className="hover:text-primary text-left"
      >
        Glosario
      </PrimaryButton>
    );
  };

  return (
    <>
      {renderButton()}
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
          <ModalHeader>Glosario funcional de Publicite</ModalHeader>
          <ModalBody>
            <p>
              Aquí podrás encontrar algunos conceptos y términos que usaremos en
              el sitio para que te acompañen y descubras funcionalidades
              mientras lo navegas. Para empezar, debes tener en cuenta una
              cuestión principal del funcionamiento del sitio. <br /> Puedes
              usarlo de dos maneras:
            </p>

            <ul className="list-disc list-inside">
              <li>
                Utiliza el sitio como usuario invitado. (Usuario Guest o
                Invitado.)
              </li>
              <li>
                Utiliza el sitio como usuario registrado. (Usuarios
                registrados.)
              </li>
            </ul>

            <p>
              La utilización del sitio como usuario registrado, te permitirá
              publicar y tendrás accesibilidad a funciones totales. Al adquirir
              planes y ampliaciones obtendrás un uso aún más extenso para
              publicar. <br />
              <strong>Registrarse:</strong> <br />
              Regístrate como empresa o persona. <br />
              <strong> Inicio de sesión:</strong> <br />
              Inicia sesión una vez registrado.
            </p>

            <p>
              <strong> Cartel de usuario:</strong>
            </p>
            <ul className="list-disc list-inside">
              <li>
                Configura la visibilidad de la información personal de tu
                Cartel.
              </li>
              <li>Configura tu cuenta.</li>
              <li>
                Desde tu cartel de usuario podrás acceder a un abanico de
                funcionalidades.
              </li>
            </ul>

            <p>
              <strong>Publicar:</strong>
            </p>
            <ul className="list-disc list-inside">
              <li>
                Anuncios: Puedes publicar anuncios de oferta (bienes y
                servicios) o de necesidad.
              </li>
              <li>
                Anuncios Libres: están determinados por una localización y rango
                de alcance. ¡Todos aquellos usuarios que coincidan con estos
                factores podrán ver tus anuncios, configúralos!
              </li>
              <li>
                Anuncios de agenda: están relacionados únicamente a tu agenda de
                contactos. ¡Quiere decir que este tipo de anuncio será
                únicamente para tus contactos, configúralos!
              </li>
              <li>
                Revistas: Podrás crear revistas, propias o compartidas, y desde
                las mismas, secciones. ¡Envía todo tipo de anuncios para crear
                tus revistas y secciones!
              </li>
              <li>
                Grupos: Podrás crear grupos y asignar colaboradores. ¡Invita o
                permite miembros nuevos! ¡Se parte de nuevos grupos!
              </li>
            </ul>

            <p>
              <strong>Ten en cuenta que:</strong> <br />
              Al momento de publicar, podrás configurar quienes de tus contactos
              de agenda podrán visualizar los anuncios. Hay tres tipos de
              relaciones. Contacto – Amigo – TopAmigo. Es necesario la
              activación a tu cuenta por parte de otros usuarios para que dichos
              anuncios sean vistos. Es decir, además de ser tu contacto en
              agenda, ha de activar tu contacto, para que así, tu anuncio sea
              visto.
            </p>
            <ul className="list-disc list-inside">
              <li>
                Si configuras para Contacto, tanto tus relaciones de Contacto,
                tus Amigos y TopAmigos verán tu anuncio;
              </li>
              <li>
                Si configuras para Amigo, tus relaciones de Contacto ya no verán
                dicho anuncio, pero si tus Amigos y TopAmigos,
              </li>
              <li>
                y finalmente si configuras para TopAmigos, solo este tipo de
                relación vera el anuncio determinado.
              </li>
            </ul>
            <p>
              Para los anuncios libres, dependerá el rango de alcance y
              localización del anuncio. Esto determina quienes verán tus
              anuncios libres. Recuerda que puedes configurar dicha
              localización. Además, al buscar, se otorga el poder de alterar la
              ubicación a voluntad.
            </p>

            <p>
              <strong>Agenda de contactos:</strong>
            </p>
            <ul className="list-disc list-inside">
              <li>
                Busca, encuentra y crea relaciones mutuas con otros contactos.
              </li>
              <li>
                Puedes sumar cuantas relaciones quieras a tu agenda de
                contactos.
              </li>
              <li>
                Activa los contactos de tu agenda para poder visualizar sus
                anuncios.
              </li>
            </ul>

            <p>
              <strong>Pizarra:</strong> <br />
              Escribe un mensaje! Según la configuración de visibilidad que
              determines, dichos usuarios podrán ver tu pizarra.
            </p>

            <p>
              <strong>Explorar:</strong> <br />
              ¡En esta sección es donde sucede la acción! Puedes elegir las
              solapas en las que quieres buscar anuncios. Lo importante aquí es
              que distingamos dos clases de solapas principales:
            </p>
            <ul className="list-disc list-inside">
              <li>Solapa de anuncios libres</li>
              <li>Solapa de anuncios de agenda</li>
            </ul>

            <p>
              En la solapa de anuncios libres encontrarás todos los anuncios
              libres que los usuarios publiquen según localización. Puedes
              configurar la ubicación de manera sencilla. Es decir, el alcance y
              localización del anuncio puede variar, pero puedes ajustar la
              ubicación. Si esto coincide o se integran entonces lo
              visualizaras. En la solapa de anuncios de agenda encontraras los
              anuncios de tus contactos de agenda. Esto significa que, según
              como tu usuario-contacto, con relación establecida, configure la
              visibilidad del anuncio, lo encontraras en esta solapa. Ya sabes,
              debes activar los contactos que quieras visualizar. Además, tienes
              las solapas de Pizarra, Carteles de Usuario y Grupos, en las
              cuales, hay: pizarras configuradas según visibilidad permitida,
              perfiles de todos los usuarios y grupos creados por los usuarios.
            </p>

            <p>
              <strong>Actividad del anuncio:</strong> <br />
              Los anuncios activos serán visibles en solapas según qué tipo de
              anuncio sea, por localización o por tu agenda de contactos. Un
              anuncio inactivo es un anuncio que ya no se está mostrando, es de
              resolver este anuncio como uno a volver a activar, quitarlo de la
              visibilidad para todos manteniéndolo en reserva, o simplemente
              puedes eliminarlo. Los anuncios vencidos son anuncios obsoletos,
              ya cumplieron con una fecha determinada.{" "}
              <em>*No queremos que pierdas tus anuncios!</em> Si tienes
              inconvenientes con los pagos los encontraras como inactivos.
            </p>

            <p>
              <strong>Planes y ampliaciones.</strong> <br />
              Tienes planes para elegir y desde estos puedes crear ampliaciones
              dentro del plan. Conócelos y elige el tuyo!
            </p>

            <p>
              ¡Eso es todo! ¡Así de sencillo! Si tienes preguntas del
              funcionamiento del sitio, sugerencias o cualquier consulta, no
              dudes en comunicarte a:{" "}
              <Link href="mailto:publicite@soonpublicite.com">
                publicite@soonpublicite.com
              </Link>{" "}
              <br /> <strong>¡Muchas gracias! ¡Bienvenido a Publicite!</strong>
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GlosaryModal;
