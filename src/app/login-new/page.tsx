import { Header } from "@/components/header"
import { LoginFormNew } from "@/components/login-form-new"

export default function LoginNewPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <LoginFormNew />
    </div>
  )
}