import { Header } from "@/components/header";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}