import NavbarWrapper from "@/components/shared/NavbarWrapper";
import Footer from "@/components/shared/Footer";

// Fonts used by the login/register pages only. Previously this exact
// <style> tag was duplicated in both page.tsx files — moved here since
// this layout already wraps both of them.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap'); .auth-fonts, .auth-fonts * { font-family: 'DM Sans', sans-serif; }`}</style>
      <NavbarWrapper />

      <main className="flex-1 auth-fonts">{children}</main>

      <Footer />
    </div>
  );
}