import Header from "@/components/header";
import PhotoGrid from "@/components/photo-grid";
import Head from "next/head";
import WindowBlind from "@/components/custom/window-blind";
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
  return (
    <>
      <Head>
        <title>Diolehroma - A curated collection of diorama</title>
        <meta
          name="description"
          content="A curated collection of diorama made by Diolehroma"
        />
      </Head>
      <Analytics />
      <WindowBlind>
        <Header />
        <PhotoGrid />
      </WindowBlind>
    </>
  );
}
