// import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Minimal Header */}
      {/* <header className="bg-white border-b border-gray-100 py-4 px-8 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-black tracking-tighter text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            nexora<span className="text-rose-400">.</span>
          </span>
        </Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back to Store
        </Link>
      </header> */}

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

 

    </div>
  );
}