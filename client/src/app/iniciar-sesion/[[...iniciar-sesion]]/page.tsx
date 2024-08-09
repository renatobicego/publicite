import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignIn path="/iniciar-sesion" routing="path" />;
}