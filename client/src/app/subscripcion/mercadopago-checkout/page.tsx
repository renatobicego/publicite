"use client";

import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string);

export default function Page() {
  // const initialization = {
  //   amount: 100,
  // };

  // const onSubmit = async (formData: any) => {
  //   // callback llamado al hacer clic en el botón enviar datos
  //   return new Promise<void>((resolve, reject) => {
  //     fetch("/process_payment", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     })
  //       .then((response) => response.json())
  //       .then((response) => {
  //         // recibir el resultado del pago
  //         resolve();
  //       })
  //       .catch((error) => {
  //         // manejar la respuesta de error al intentar crear el pago
  //         reject();
  //       });
  //   });
  // };

  // const onError = async (error: any) => {
  //   // callback llamado para todos los casos de error de Brick
  //   console.log(error);
  // };

  // const onReady = async () => {
  //   /*
  //     Callback llamado cuando Brick está listo.
  //     Aquí puedes ocultar cargamentos de su sitio, por ejemplo.
  //   */
  // };

  // return (
  //   <CardPayment
  //     initialization={initialization}
  //     onSubmit={onSubmit}
  //     onReady={onReady}
  //     onError={onError}
  //   />
  // );
  return <></>;
}
