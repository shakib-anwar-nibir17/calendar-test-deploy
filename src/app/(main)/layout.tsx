import { Header } from "@/components/main/header";
import MainLayout from "@/components/main/main-layout";

export default function Layout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <Header title="Home" />
      {children}
    </MainLayout>
  );
}
