import { SignUp } from "@clerk/nextjs";
import { Image } from "@nextui-org/react";

export default function SignUpPage() {
  return (
    <main className="w-screen h-screen flex">
      <div className="flex justify-center items-center bg-fondo flex-1">
        <Image src="/logo.png" alt="Logo" width={300} height={200} />
      </div>
      <div className="flex justify-center items-center bg-white flex-1 rounded-[40px] shadow-xl"> 
        <SignUp appearance={{ elements: { cardBox: "shadow-lg" } }} />

      </div>
    </main>
  );
}
