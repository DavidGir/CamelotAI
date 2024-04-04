// Add authentication to app from Clerk:
import { ClerkProvider, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
// Add web analytics to app from Vercel Analytics:
import { Analytics } from "@vercel/analytics/react";
import { Lancelot } from "next/font/google";
import "../styles/global.css";
import dynamic from "next/dynamic";

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
          <ClerkLoading>
            <div className="fixed bg-ancient-beige top-0 left-0 w-full h-full z-50 flex justify-center items-center">
            <LoadingAnimation />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            {children}
          </ClerkLoaded>
        </body>
      </html>
    </ClerkProvider>
  );
}
