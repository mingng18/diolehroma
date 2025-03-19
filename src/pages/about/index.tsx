import WindowBlind from "@/components/custom/window-blind";
import Header from "@/components/header";
import Head from "next/head";
import React from "react";

export default function About() {
  return (
    <>
      <Head>
        <title>About - Ludens Garage</title>
        <meta name="description" content="About Ludens Garage" />
      </Head>
      <WindowBlind>
        <div className="flex items-center justify-center h-screen">
          <Header />
          <p className="font-mono text-md font-light tracking-widest text-gray-900">
            Wait I am still working on it...
          </p>
        </div>
      </WindowBlind>
    </>
  );
}
