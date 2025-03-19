import Header from "@/components/header";
import PhotoGrid from "@/components/photo-grid";
import Head from "next/head";
import ClickSpark from "@/components/bits/ClickSpark/ClickSpark";
import WindowBlind from "@/components/custom/window-blind";
// import Stairs from "@/components/custom/stair";

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
      <WindowBlind>
        <Header />
        <PhotoGrid />

        {/* <ClickSpark
          sparkColor="#000"
          sparkSize={6}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
        </ClickSpark> */}
      </WindowBlind>
    </>
  );
}
