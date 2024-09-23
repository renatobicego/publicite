import { SignUp } from "@clerk/nextjs";
export default function SignUpPage() {
  return <SignUp appearance={{ elements: { cardBox: "shadow-lg" } }} />;
}
