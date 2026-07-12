import Navbar from "@/components/shared/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1A1A1A] flex flex-col">
      <Navbar />

      <main className="flex-1 p-6 md:p-12 pt-28 md:pt-32 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}