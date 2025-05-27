import { FaCcMastercard } from "react-icons/fa";
import { FaCcAmex, FaCcVisa } from "react-icons/fa6";

export const getPaymentDetails = (code: string) => {
  switch (code) {
    case "accredited":
      return "Pago exitoso";
    case "pending_capture":
      return "Pago capturado";
    case "in_process":
      return "Pago en proceso";
    case "cc_rejected_insufficient_amount":
      return "Sin saldo suficiente";
    case "by_payer":
    case "by_admin":
    case "by_collector":
      return "Pago cancelado";
    case "cc_rejected_bad_filled_card_number":
    case "cc_rejected_bad_filled_other":
      return "Tarjeta inválida";
    case "cc_rejected_bad_filled_security_code":
      return "Código de seguridad inválido";
    case "cc_rejected_bad_filled_date":
      return "Fecha de vencimiento inválida";
    case "cc_rejected_card_disabled":
    case "cc_rejected_blacklist":
      return "Tarjeta inhabilitada";
    case "cc_rejected_high_risk":
      return "Rechazado por Prevención de Fraude";
    case "cc_rejected_max_attempt":
      return "Se excedió el número máximo de intentos";
    default:
      return "Pago rechazado";
  }
};

export const getPaymentIcon = (paymentMethod: string) => {
  switch (true) {
    case paymentMethod.includes("visa"):
      return <FaCcVisa className="size-6 text-[#1565C0]" />;
    case paymentMethod.includes("master"):
      return <FaCcMastercard className="size-6 text-[#EB001B]" />;
    case paymentMethod.includes("amex"):
      return <FaCcAmex className="size-6 text-[#016FD0]" />;
    case paymentMethod.includes("naranja"):
      return (
        <div
          role="img"
          data-testid="icon"
          className="size-6"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 25 25"
            aria-hidden="true"
            fill="none"
            height="25"
            width="25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m18.489 12.156-3.175-4.894a.38.38 0 0 0-.324-.175h-2.115a.18.18 0 0 0-.158.093.18.18 0 0 0 .007.182l3.31 5.101a.03.03 0 0 1 0 .035l-3.31 5.086a.18.18 0 0 0-.007.183.18.18 0 0 0 .158.093h2.117a.38.38 0 0 0 .323-.175l3.174-4.878a.6.6 0 0 0 0-.651"
              fill="#FE5000"
            ></path>
            <path
              d="M19.145 13.152a.18.18 0 0 0-.302 0l-.872 1.34a.86.86 0 0 0 0 .937l1.486 2.277a.34.34 0 0 0 .285.153h2.191c.056 0 .108-.03.134-.079a.15.15 0 0 0-.006-.154zm-.302-1.358a.18.18 0 0 0 .302 0L22.06 7.32a.15.15 0 0 0 .006-.155.15.15 0 0 0-.134-.08H19.74a.34.34 0 0 0-.284.155L17.97 9.516a.86.86 0 0 0 0 .938z"
              fill="#50007F"
            ></path>
            <path
              d="M11.835 7.083H9.98c-.1 0-.18.08-.18.178v6.541c-.002.108-.058.14-.12.036L5.4 7.245a.36.36 0 0 0-.3-.162h-2a.18.18 0 0 0-.182.18v10.42c0 .105.086.181.182.181h1.853c.1 0 .18-.08.18-.178v-6.541c.003-.108.059-.14.121-.035l4.28 6.592a.36.36 0 0 0 .3.162h2a.18.18 0 0 0 .182-.18V7.264a.18.18 0 0 0-.181-.181"
              fill="#FE5000"
            ></path>
          </svg>
        </div>
      );
    case paymentMethod.includes("cabal"):
      return (
        <div role="img" className="size-6" aria-hidden="true">
          <svg
            viewBox="0 0 25 25"
            aria-hidden="true"
            fill="none"
            height="25"
            width="25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.944 22.084c-.007-.105-.018-.211-.018-.316q0-9.26-.008-18.513c0-.291.078-.338.33-.338 17.537.007.963.01 18.5.007.108 0 .215.012.324.02q0 6.422-.007 12.845c0 .982.063 1.967-.036 2.948-.193 1.882-1.682 3.312-3.462 3.325h-.462c-13.262 0-11.998.014-15.161.022"
              fill="#fff"
            ></path>
            <path
              clip-rule="evenodd"
              d="m2.944 22.084-.006-.09a3 3 0 0 1-.012-.226q0-9.26-.008-18.513c0-.291.078-.338.33-.338 8.527.004 8.99.006 9.23.007h9.27q.114.002.23.012l.094.008q0 6.422-.007 12.845.001.411.01.823c.012.709.025 1.418-.046 2.125-.193 1.882-1.682 3.312-3.462 3.325h-.462c-9.894 0-11.703.008-13.297.015h-.001c-.543.002-1.06.005-1.863.007M13.106 6.257v3.09c0 .087.046.131.093.176l.033.032q1.164 1.233 2.333 2.464c.31.328.317.615.009.94a752 752 0 0 1-2.303 2.42.55.55 0 0 0-.169.427c.008.391.005.783.003 1.175l-.003.589v1.123l.045-.018c.018-.007.028-.01.035-.018l5.308-5.546c.36-.379.351-.844-.007-1.225q-.6-.634-1.206-1.264l-.44-.459zM6.79 13.163c-.399-.412-.428-.882-.059-1.268 1.418-1.487 2.839-2.97 4.284-4.477l1.11-1.159v.798c0 .775 0 1.523.003 2.274.001.113-.058.174-.12.236l-.024.025q-1.16 1.205-2.32 2.435c-.312.338-.312.61 0 .94q1.143 1.206 2.3 2.412a.56.56 0 0 1 .162.43v2.92c-.2-.21-.382-.395-.557-.575l-.187-.191z"
              fill-rule="evenodd"
              fill="#016398"
            ></path>
          </svg>
        </div>
      );
    default:
      return;
  }
};
