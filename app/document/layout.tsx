import Header from "@/components/ui/HeaderDashboard";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        {children}
      </div>
    </TooltipProvider>
  );
}