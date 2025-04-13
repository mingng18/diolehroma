"use client";

import WindowBlind from "@/components/custom/window-blind";
import MediaBetweenText from "@/components/fancy-components/media-between-text";
import Header from "@/components/header";
import useScreenSize from "@/hooks/use-screen-size";
import SampleImage from "@/images/advance-garage/IMG_1265.jpg";

import Head from "next/head";
import React from "react";

export default function About() {
  const screenSize = useScreenSize();

  return (
    <>
      <Head>
        <title>About - Ludens Garage</title>
        <meta name="description" content="About Ludens Garage" />
      </Head>
      <WindowBlind>
        <div className="flex items-center justify-center h-screen">
          <Header />

          <MediaBetweenText
            firstText="Im ludens ("
            secondText=") garage!"
            mediaUrl={SampleImage}
            mediaType="image"
            triggerType="hover"
            mediaContainerClassName="w-full h-[120px] sm:h-[100px] overflow-hidden mx-px mt-1 sm:mx-2 sm:mt-4"
            className="cursor-pointer flex flex-row items-center justify-center w-full font-mono text-xl font-bold tracking-widest text-gray-900"
            animationVariants={{
              initial: { width: 0 },
              animate: {
                width: screenSize.lessThan("sm") ? "30px" : "100px",
                transition: { duration: 0.4, type: "spring", bounce: 0 },
              },
            }}
          />
        </div>
      </WindowBlind>
    </>
  );
}
