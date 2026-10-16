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
              <strong>Mis Producciones (blogs):</strong> <br />
              Publica tu contenido propio en un blog, personal o de un grupo:
              fotos, videos, audios, escritos, documentos y artículos.
            </p>
            <ul className="list-disc list-inside">
              <li>
                Organiza: crea carpetas y subcarpetas, sube varios archivos a la
                vez o arrástralos desde tu computadora y suéltalos sobre el blog
                o sobre una carpeta.
              </li>
              <li>
                Mueve: selecciona uno o varios elementos y toca
                &quot;Mover&quot; para elegir la carpeta de destino, o arrastra
                el elemento y suéltalo sobre una carpeta.
              </li>
              <li>
                Navega: usa las flechas Atrás y Adelante, busca por nombre,
                filtra por tipo, ordena y elige entre vista de grilla o de
                lista. En la grilla puedes agrandar o achicar los íconos.
                Dentro de un archivo, pasa al anterior o al siguiente.
              </li>
              <li>
                Ver como visitante: revisa cómo queda tu blog o tu artículo sin
                los controles de edición.
              </li>
              <li>
                Compartir: cada carpeta, archivo o artículo tiene su propio
                link, que lleva directo a ese contenido y no al inicio del
                blog.
              </li>
              <li>
                Alcance, clave y tickets: define quién ve cada contenido, pide
                una clave de acceso o crea tickets gratuitos o pagos.
              </li>
              <li>
                Sólo yo: deja el blog, una carpeta, un archivo o un artículo
                visible únicamente para ti, aunque otro tenga la clave o el
                link.
              </li>
              <li>
                Mapa de tickets (menú Opciones): todo el blog en recuadros de
                colores. Verde es gratis, azul es ticket gratuito y naranja es
                ticket pago. Toca un recuadro para configurar su ticket.
              </li>
              <li>
                Fans: el contador está junto al título del blog. Toca
                &quot;Hacerme fan&quot; para seguirlo.
              </li>
              <li>
                Artículos: al escribir se muestra el recuento de palabras y
                tienes una barra de formato fija arriba del editor, como en
                Word.
              </li>
              <li>
                PDF y Word (.docx): se leen dentro del blog, sin descargarlos.
              </li>
              <li>
                Tablero de trabajo: envía a tu blog las imágenes generadas y
                las Valuaciones IA, a una carpeta nueva o existente.
              </li>
              <li>
                Denuncias: se hacen desde el menú de opciones del blog. Tu
                identidad queda protegida: el dueño ve qué se denunció y el
                motivo, pero no quién lo hizo.
              </li>
              <li>
                Reseñas y comentarios: el puntaje del blog y el botón para
                reseñar están en su encabezado. En los comentarios, toca la foto
                o el @usuario para ir a su cartel; quien escribió un comentario
                puede eliminarlo.
              </li>
              <li>
                Eliminar blog: para confirmar hay que escribir el nombre del
                blog. Se borra todo su contenido.
              </li>
            </ul>

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
