"use client";
import {
  Button,
  Image,
  Link,
  LinkIcon,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";

const AboutUs = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        variant="light"
        className="text-white -ml-4 -mt-1.5 data-[hover=true]:bg-transparent"
      >
        Sobre Nosotros
      </Button>
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
          <ModalHeader>Sobre Nosotros</ModalHeader>
          <ModalBody>
            <h5>¿Qué es Publicite?</h5>
            <p>
              Publicite es un emprendimiento en desarrollo impulsado por un
              grupo de programadores web y estudiantes de diseño. El proyecto
              inició durante 2024 y fue lanzado al uso internacional en 2025.
              Agradecemos especialmente a nuestro equipo de trabajo.
            </p>

            <p>
              <strong>Desarrollo:</strong>{" "}
              <Link href="https://dutsiland.com/">Dutsiland.</Link> <br />
              <strong>Testing:</strong> Gabriel Gesta.
            </p>

            <p>
              Buscamos impulsar la app para su mejora, actualización y creación
              de nuevas secciones.
            </p>
            <p>
              Explorar y potenciar el concepto publicitario en su mayor
              expresión.
            </p>

            <h5>¿Quiénes somos?</h5>
            <p>
              En Publicite creamos, para las personas, usuarios y
              organizaciones, una experiencia publicitaria única. ¡Consiste en
              posibilitar vías de desarrollo de contacto y navegación entre
              usuarios, para que sus anuncios consigan cumplir un destino
              exitoso!
            </p>

            <h5>¿Qué hacemos?</h5>
            <p>
              Ya sea mediante la publicación de anuncios para que te contacten,
              la interacción y valoración o simplemente para informar desde la
              visualización.
            </p>

            <p>
              Los usuarios registrados dispondrán, por defecto, de una cuenta
              gratuita además de navegación total del sitio. Pagando un plan
              accesible, podrán acceder a ampliaciones dentro de la aplicación.
            </p>

            <p>
              Los usuarios, tanto guest como registrados, pueden navegar el
              sitio sin registrarse. De esta manera, verán anuncios y podrán
              contactar a quienes lo permitan.
            </p>

            <h5>¿Qué puedo hacer en Publicite?</h5>
            <p>
              Quienes anuncian han de encontrarse con quienes están buscando, y
              viceversa.
            </p>
            <p>
              De esta manera se fomenta el satisfacer la demanda por medio de
              ofertas y generar ofertantes por medio de necesidades.
            </p>

            <p>
              Crea grupos, guarda nuevos contactos en tu agenda (de cupo
              ilimitado), activa contactos de tu agenda para la visualización e
              interacción, invita nuevos usuarios a la app a crearse una cuenta,
              ¡crea tu revista de anuncios y más actividades!
            </p>

            <p>
              También podrás alcanzar comunicación de contactos y usuarios,
              matchear anuncios, hacer coincidir búsquedas y otros medios de
              contacto y comunicación.
            </p>

            <h5>¿Cómo comienzo a navegar el sitio?</h5>
            <p>Puedes hacer uso de Publicite de forma pública o privada.</p>
            <p>¿Qué significa esto?</p>

            <p>
              Si lo quieres usar solo con tus contactos y/o amigos, adelante.
              Podrás configurarlo de manera sencilla para un perfil privado.
            </p>

            <p>
              Si quieres dedicar la app a que sea pública, usarás los anuncios
              de localización (anuncios libres) para publicar. De esta manera,
              puedes configurarlos según sus límites geográficos o posibilidades
              del anuncio, permitiendo que cualquier usuario guest o registrado
              los visualice.
            </p>

            <p>
              Además, cada anuncio puede configurarse para ser más público o más
              privado, generando una navegación híbrida público-privada a tu
              voluntad.
            </p>

            <h5>¿Por qué anunciar en Publicite?</h5>
            <p>
              En Publicite transformamos la manera en que las personas, empresas
              u organizaciones hacen anuncios públicos.
            </p>
            <p>
              Nuestra misión es crear, actualizar, simplificar, mejorar y
              revolucionar el concepto publicitario.
            </p>

            <p>Queremos llevar el sitio a ser una elección internacional.</p>
            <p>¡Los usuarios podrán llevar sus publicidades a lo más alto!</p>

            <p>Crear, actualizar y mejorar una herramienta publicitaria.</p>
            <p>
              Que puedas utilizar y comunicarte mediante tu cuenta con cualquier
              usuario y/o anuncio del mundo.
            </p>

            <h5>Recomendaciones</h5>
            <p>
              <strong>Cuentas:</strong> Gratuitas – Planes – Ampliaciones
            </p>
            <p>
              <strong>Carteles:</strong> Privados, públicos e híbridos.
            </p>

            <h5>Modos de uso</h5>
            <p>
              Visita el sitio como un usuario guest o regístrate y sé un usuario
              registrado para acceder a todas las funcionalidades de la app.
            </p>

            <h5>Mis herramientas (Usuarios Registrados)</h5>
            <p>
              <strong>Home</strong>
            </p>
            <p>
              <strong>Exploración:</strong> Búsquedas y resultados
            </p>
            <p>
              <strong>Mi cuenta:</strong> Mi Cartel, Revistas, Grupos, Pizarra
            </p>
            <p>
              <strong>Agenda de contactos</strong>
            </p>
            <p>
              <strong>Creación de Anuncios:</strong> Oferta o necesidad
            </p>

            <p>
              Para información más detallada sobre el funcionamiento del sitio,
              accede al glosario funcional.
            </p>

            <p>Tus comentarios nos ayudan a mejorar el sitio.</p>
            <p>
              Puedes comunicarte a:{" "}
              <Link color="primary" href="mailto:publicite@soonpublicite.com">
                publicite@soonpublicite.com
              </Link>
            </p>

            <Image
              src="/logo.png"
              alt="logo publicite"
              classNames={{
                wrapper: "self-end float-right",
              }}
              width={50}
              height={32.5}
            />
            <h5 className="text-right">Publicite</h5>
            <p className="text-right">Tu sitio publicitario.</p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AboutUs;
