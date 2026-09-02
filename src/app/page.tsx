import { redirect } from "next/navigation";

export default function RootPage() {
  // Redireciona quem acessar o link principal direto para o app.
  // O middleware/layout do dashboard já vai forçar o login se a pessoa não estiver logada.
  redirect("/dashboard");
}