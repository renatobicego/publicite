"use client";
import { Textarea, TextAreaProps } from "@nextui-org/react";

interface ChatTextareaProps
  extends Omit<TextAreaProps, "onKeyDown" | "value" | "onValueChange"> {
  value: string;
  onValueChange: (value: string) => void;
  /** Se llama con Enter (sin Shift). */
  onSend: () => void;
  /** Muestra la ayuda "Enter para enviar · Shift+Enter…". Default: true. */
  showHint?: boolean;
}

// En pantallas táctiles el teclado no tiene Shift+Enter cómodo: ahí Enter
// hace un renglón nuevo y se envía con el botón.
const isTouchDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(pointer: coarse)").matches;

/**
 * Campo de texto de los chats de Cubito: arranca con 3 renglones y crece.
 * Enter envía y Shift+Enter agrega un renglón (salvo en celular).
 */
const ChatTextarea = ({
  value,
  onValueChange,
  onSend,
  showHint = true,
  minRows = 3,
  maxRows = 8,
  description,
  ...props
}: ChatTextareaProps) => (
  <Textarea
    {...props}
    value={value}
    onValueChange={onValueChange}
    minRows={minRows}
    maxRows={maxRows}
    variant={props.variant ?? "bordered"}
    onKeyDown={(event) => {
      // Mientras se compone un acento o un carácter (IME) Enter no envía.
      if (event.nativeEvent.isComposing) return;
      if (event.key === "Enter" && !event.shiftKey && !isTouchDevice()) {
        event.preventDefault();
        onSend();
      }
    }}
    description={
      description ??
      (showHint ? (
        <span className="max-md:hidden">
          Enter para enviar · Shift+Enter para un renglón nuevo
        </span>
      ) : undefined)
    }
  />
);

export default ChatTextarea;
