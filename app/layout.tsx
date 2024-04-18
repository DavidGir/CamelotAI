// Add authentication to app from Clerk:
import { ClerkProvider, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
// Add web analytics to app from Vercel Analytics:
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Roboto } from "next/font/google";
import "../styles/global.css";
import dynamic from "next/dynamic";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { Metadata } from 'next';

// Using dynamic import as the loading animation will only be loaded and rendered client-side
// which is useful as it contains client-specific code (like direct DOM manipulations or document objects which are not available on the server).
const LoadingAnimation = dynamic(
  () => import("../components/ui/LoadingAnimation"),
  { ssr: false }
);

const roboto = Roboto({ 
  weight: "300",
  subsets: ["latin"],
  display: "swap",
});

let title = 'CamelotAI';
let description = 'CamelotAI is a platform that helps you chat with your docs!';
let url = 'https://camelotai.vercel.app/';
let sitename = 'CamelotAI.com';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
};

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
          colorBackground: "rgb(229, 231, 235)",
          borderRadius: "10px",
        }
      }}
    >
      <html lang='en' className={roboto.className}>
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
