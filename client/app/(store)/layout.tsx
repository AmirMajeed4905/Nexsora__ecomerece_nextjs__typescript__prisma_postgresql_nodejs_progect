// import NavbarWrapper from "@/components/shared/NavbarWrapper";
// import Footer from "@/components/shared/Footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* <NavbarWrapper /> */}

      <main className="flex-1">{children}</main>
    </div>
  );
}