"use client";

import React from "react";
import Head from "next/head";
import WindowBlind from "@/components/custom/window-blind";
import MediaBetweenText from "@/components/fancy-components/media-between-text";
import ComesInGoesOutUnderline from "@/components/fancy-components/underline-button";
import Header from "@/components/header";
import useScreenSize from "@/hooks/use-screen-size";
import SampleImage from "@/images/advance-garage/IMG_1265.jpg";

export default function About() {
  const screenSize = useScreenSize();

  return (
    <>
      <Head>
        <title>About - Ludens Garage</title>
        <meta name="description" content="About Ludens Garage" />
      </Head>
      <WindowBlind>
        <div className="flex flex-col items-center justify-between min-h-screen p-4 sm:p-8 md:p-12">
          <Header />
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <MediaBetweenText
              firstText={`Im ludens (`}
              secondText={`) garage!`}
              mediaUrl={SampleImage}
              mediaType="image"
              triggerType={screenSize.lessThan("sm") ? "inView" : "hover"}
              mediaContainerClassName="w-full h-[120px] sm:h-[100px] overflow-hidden mx-px mt-1 sm:mx-2 sm:mt-4"
              className="cursor-pointer flex flex-row items-center justify-center w-full font-mono text-base sm:text-xl font-bold tracking-widest text-gray-900"
              animationVariants={{
                initial: { width: 0 },
                animate: {
                  width: screenSize.lessThan("sm") ? "80px" : "160px",
                  height: screenSize.lessThan("sm") ? "80px" : "120px",
                  transition: { duration: 0.4, type: "spring", bounce: 0 },
                },
              }}
            />
          </div>

          <div className="w-full mt-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="col-span-1">
                <p className="font-mono text-xs sm:text-sm font-bold text-gray-800">
                  Based in Singapore
                </p>
                <p className="font-mono text-xs sm:text-sm text-gray-500 mt-2">
                  Ludens Garage is a garage that specializes in custom car
                  builds.
                </p>
              </div>
              <div className="col-span-1 hidden md:block"></div>
              <div className="col-span-1 hidden md:block"></div>
              <div className="col-span-1 mt-8 sm:mt-0">
                <p className="font-mono text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Contact us at
                </p>
                <div className="flex flex-row sm:flex-col items-start gap-4 sm:gap-2">
                  <a
                    href="https://www.instagram.com/ludens_garage/"
                    target="_blank"
                    className="font-mono text-xs text-gray-500"
                  >
                    <ComesInGoesOutUnderline
                      label="Instagram"
                      direction="left"
                    />
                  </a>
                  <a
                    href="https://www.carousell.sg/u/heyimzc?fbclid=PAZXh0bgNhZW0CMTEAAaf6VmZ7SoF14ZZOBUq7SoyH-prjqrvwVy0AoMJD7IqrXDGxQAxvr50G6tfdbw_aem_B4KnuEGJJ5WEbvdg-piSpw&_branch_match_id=1317367697995831845&utm_source=share-native&utm_campaign=share-own-profile&utm_medium=sharing&_branch_referrer=H4sIAAAAAAAAAw3GSw6CMBQAwNu4Q9DwSUyMqYAoxr8C6YZQKFAttDwQcOPZdVZTdp1sF6qaJiDeLeV8mkg55ax%2BqewEFzca5%2BOVrHKScpYtzwhHpUaKY4lDzT7cXYSS3AwqbN3EZqZjfFo%2Fmv8%2FW0XCs4F%2BCD4aEgffsXYNRI43XtDYg6F5ZpdnZIgTWsVrfV%2B%2FXc%2F3jdQlfVYokt3kMPkCzSkAq4uYgBhaCku7BFHRHwQGOG6zAAAA"
                    target="_blank"
                    className="font-mono text-xs text-gray-500"
                  >
                    <ComesInGoesOutUnderline
                      label="Carousel"
                      direction="left"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WindowBlind>
    </>
  );
}
