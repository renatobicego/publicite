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

const PrivacyPolicy = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button
        onPress={onOpen}
        radius="full"
        variant="light"
        className="text-white -ml-4 -my-2 data-[hover=true]:bg-transparent"
      >
        Política de Privacidad
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
          <ModalHeader>Política de Privacidad</ModalHeader>
          <ModalBody>
            <p>
              🛡️ <strong>Última actualización:</strong> 2 de noviembre de 2025
            </p>

            <h5>Aviso de edad</h5>
            <p>
              La app y el sitio web <strong>SoonPublicité</strong> están
              destinados exclusivamente a personas mayores de 18 años. Si eres
              menor de 18 años, no debes utilizar nuestros servicios.
            </p>

            <h5>1. Responsable del tratamiento de datos</h5>
            <p>
              La app y el sitio web <strong>www.soonpublicite.com</strong> son
              operados por
              <strong> Soonpublicite S.A.</strong>, con domicilio en Buenos
              Aires, Argentina.
            </p>
            <p>
              📩 Correo de contacto exclusivo para temas de privacidad:
              <strong> publicite@soonpublicite.com</strong>
            </p>

            <h5>2. Tipos de usuarios y recopilación de información</h5>
            <p>Soon Publicité permite el acceso a dos tipos de usuarios:</p>

            <ul className="list-inside list-disc">
              <li>
                <strong>a) Usuarios no registrados (guest):</strong> pueden
                navegar por contenido público disponible en la plataforma. No se
                recopilan datos personales identificables, salvo los necesarios
                para fines técnicos o analíticos (cookies, IP, navegador,
                idioma, etc.). Pueden contactar a usuarios que permitan la
                interacción.
              </li>
              <li>
                <strong>b) Usuarios registrados (UR, cuenta gratuita):</strong>{" "}
                pueden publicar contenido libre o mediante agenda de contactos.
                Se recopilan datos de registro (nombre, correo electrónico y
                contraseña), ubicación, información técnica del dispositivo y
                contenido publicado (texto, imágenes, videos y audios). Los
                usuarios controlan la visibilidad de sus publicaciones: pública,
                privada o híbrida. Pueden crear grupos, revistas, anuncios y
                gestionar su agenda de contactos, activando o desactivando la
                visibilidad de cada contacto. Soonpublicite S.A. no accede a tus
                contactos personales fuera de la app, y toda gestión de agenda
                se realiza dentro de la plataforma.
              </li>
            </ul>

            <h5>3. Uso de la información</h5>
            <p>La información recopilada se utiliza para:</p>
            <ul className="list-inside list-disc">
              <li>
                Permitir la publicación de anuncios, contenido multimedia y
                gestión de contactos.
              </li>
              <li>
                Mostrar publicaciones según visibilidad, grupo o
                geolocalización.
              </li>
              <li>
                Analizar y mejorar la experiencia de navegación y el rendimiento
                de la app.
              </li>
              <li>Mantener la seguridad y prevenir usos indebidos.</li>
            </ul>

            <h5>Contenido público, privado e híbrido</h5>
            <ul className="list-inside list-disc">
              <li>
                <strong>Publicaciones libres:</strong> visibles por todos los
                usuarios, registrados y no registrados, según la configuración
                de geolocalización.
              </li>
              <li>
                <strong>Publicaciones de agenda de contactos:</strong> visibles
                solo para los grupos seleccionados (contactos, amigos,
                topamigos).
              </li>
              <li>
                <strong>Contactos activos/inactivos:</strong> los contactos
                activos ven las publicaciones; los inactivos no.
              </li>
              <li>
                <strong>Audios y videos:</strong> se almacenan de forma segura;
                el contenido privado no se comparte fuera de los permisos
                seleccionados, mientras que el contenido público será accesible
                según configuración de visibilidad.
              </li>
            </ul>

            <h5>4. Base legal y retención de datos</h5>
            <p>
              El tratamiento de datos se realiza con consentimiento del usuario
              al usar la app o registrarse. Los datos se conservan solo mientras
              sean necesarios para los fines descritos o según la legislación
              vigente.
            </p>

            <h5>5. Contenido generado por los usuarios</h5>
            <p>
              Los usuarios son responsables del contenido que publican,
              incluyendo información personal, bienes o servicios ofrecidos,
              imágenes, videos, audios y textos. Soonpublicite S.A. no se hace
              responsable del contenido generado por terceros, pero se reserva
              el derecho de moderar, ocultar o eliminar contenido que sea
              ilegal, inapropiado o infrinja derechos de terceros.
            </p>

            <h5>6. Compartir información con terceros</h5>
            <p>
              No se venden ni ceden datos personales a terceros con fines
              comerciales. Los datos pueden compartirse de forma anónima para
              análisis estadístico o por requerimiento legal.
            </p>

            <h5>7. Seguridad de los datos</h5>
            <p>
              Se implementan medidas técnicas y organizativas para proteger los
              datos personales y el contenido publicado contra accesos no
              autorizados, pérdida o divulgación indebida. Los archivos
              multimedia (imágenes, videos, audios) se almacenan con protocolos
              de cifrado y control seguro de acceso.
            </p>

            <h5>8. Derechos de los usuarios</h5>
            <p>
              De acuerdo con la Ley N° 25.326 (Argentina), los usuarios pueden:
            </p>
            <ul className="list-inside list-disc">
              <li>
                Acceder, corregir, actualizar o eliminar sus datos personales.
              </li>
              <li>
                Retirar su consentimiento para el tratamiento de sus datos.
              </li>
              <li>Consultar cualquier inquietud sobre privacidad.</li>
            </ul>
            <p>
              Para ejercer estos derechos:{" "}
              <strong>publicite@soonpublicite.com</strong>
            </p>

            <h5>9. Cambios en la política</h5>
            <p>
              Soonpublicite S.A. puede actualizar esta política en cualquier
              momento. Se recomienda revisar periódicamente la misma. La fecha
              de última actualización figura al inicio del documento.
            </p>

            <h5>10. Contacto</h5>
            <p>
              📍 <strong>Soonpublicite S.A.</strong> – Buenos Aires, Argentina
            </p>
            <p>
              🌐 <strong>www.soonpublicite.com</strong>
            </p>
            <p>
              📧 <strong>publicite@soonpublicite.com</strong>
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PrivacyPolicy;
