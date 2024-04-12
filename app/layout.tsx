// Add authentication to app from Clerk:
import { ClerkProvider, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
// Add web analytics to app from Vercel Analytics:
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Lancelot } from "next/font/google";
import "../styles/global.css";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

// Using dynamic import as the loading animation will only be loaded and rendered client-side
// which is useful as it contains client-specific code (like direct DOM manipulations or document objects which are not available on the server).
const LoadingAnimation = dynamic(
  () => import("../components/ui/LoadingAnimation"),
  { ssr: false }
);

const lancelot = Lancelot({ 
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "black",
          colorBackground: "#F3DFC1",
          borderRadius: "10px",
        }
      }}
    >
      <html lang='en' className={lancelot.className}>
        <body>
          <Analytics />
          <SpeedInsights />
          <ClerkLoading>
            <LoadingAnimation />
          </ClerkLoading>
          <ClerkLoaded>
            {children}
            <ToastContainer 
              limit={1}
              newestOnTop={false}
            />
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
