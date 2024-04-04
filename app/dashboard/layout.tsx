import Header from "../../components/ui/HeaderDashboard";
import Footer from "../../components/homepage/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col ancient-scroll-bg-2">
      <Header />
      <div className="flex-grow">{children}</div>
      <div className="bottom-0 w-full">
        <Footer />
      </div>
    </div>
  );
}