import "@/styles/globals.css";
import { AnimatePresence } from "framer-motion";
import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import { useNextCssRemovalPrevention } from "@madeinhaus/nextjs-page-transition";
import Loader from "@/components/loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps, router }: AppProps) {
  useNextCssRemovalPrevention();

  return (
    <main
      className={`${geistSans.variable} ${geistMono.variable} font-mono bg-zinc-50 text-neutral-800`}
    >
      <AnimatePresence mode="wait">
        <Loader>
          <Component key={router.route} {...pageProps} />
        </Loader>
      </AnimatePresence>
    </main>
  );
}
