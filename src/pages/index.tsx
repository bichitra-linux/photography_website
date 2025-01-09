import Image from "next/image";
import Head from "next/head";
import { useMemo } from "react";
import { GetStaticProps } from "next";
import nodeFetch from "node-fetch";
import { createApi } from "unsplash-js";
import classNames from "classnames";
import bgImage from "../../public/Images/photography-bg.jpeg";
import Link from "next/link";
import { getImages } from "@/utils/image-util";
import { Photo } from "@/types/types";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Gallery } from "@/components/gallery/Gallery";

const tabs = [
  {
    key: "all",
    display: "All",
  },
  {
    key: "oceans",
    display: "Oceans",
  },
  {
    key: "forests",
    display: "Forests",
  },
  {
    key: "cities",
    display: "Cities",
  },
];

type HomeProps = {
  oceans: Photo[];
  forests: Photo[];
  cities: Photo[];
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY!,
    fetch: nodeFetch as unknown as typeof fetch,
  });

  const [oceans, forests, cities] = await Promise.all([
    getImages(unsplash, "oceans"),
    getImages(unsplash, "forests"),
    getImages(unsplash, "cities"),
  ]);

  return {
    props: {
      oceans,
      forests,
      cities,
    },
    // revalidate: 10,    uncomment for ISR
  };
};

export default function Home({ oceans, forests, cities }: HomeProps) {
  const allPhotos = useMemo(() => {
    const all = [...oceans, ...forests, ...cities];

    return all.sort((a, b) => b.likes - a.likes);
  }, [oceans, forests, cities]);

  return (
    <div>
      {/* Head component */}
      <Head>
        <title>photography Website</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="UTF-8" />
        <meta name="author" content="Bichitra Gautam" />
        <meta name="description" content="dynamic photography web app" />
        <meta name="keywords" content="photography, web app, dynamic" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Background */}

      <Image
        priority
        className="fixed left-0 top-0 z-0"
        src={bgImage}
        alt="background-image"
        placeholder="blur"
      />

      {/* Content */}

      <div className="fixed left-0 top-0 w-full h-full z-10 from-stone-900 bg-gradient-to-t"></div>

      {/* Header */}

      <header className="fixed top-0 w-full z-30 flex justify-between items-center h-[90px] px-10">
        <div className="hidden">ok</div>
        <div>
          <span className="uppercase text-lg font-medium">Photography Website</span>
        </div>
        <div>
          <Link
            href="#"
            className="rounded-3xl bg-white text-stone-700 px-3 py-2 hover:bg-opacity-90"
          >
            Get in touch
          </Link>
        </div>
      </header>

      {/* main */}

      <main className="relative pt-[110px] z-20">
        <div className="flex flex-col items-center h-full">
          <TabGroup>
            <TabList className="flex items-center gap-12">
              {tabs.map((tab) => (
                <Tab key={tab.key} className="p-2">
                  {({ selected }) => (
                    <span
                      className={classNames(
                        "uppercase text-lg",
                        selected ? "text-white" : "text-stone-600"
                      )}
                    >
                      {tab.display}
                    </span>
                  )}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="h-full max-w-[900px] w-full p-2 sm:p-4 my-6">
              <TabPanel className="overflow-auto">
                <Gallery photos={allPhotos} />
              </TabPanel>
              <TabPanel>
                <Gallery photos={oceans} />
              </TabPanel>
              <TabPanel>
                <Gallery photos={forests} />
              </TabPanel>
              <TabPanel>
                <Gallery photos={cities} />
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </main>

      {/* Footer */}

      <footer className="relative h-[90px] flex justify-center items-center uppercase text-lg font-medium z-20">
        <span>Photography portfolio</span>
      </footer>
    </div>
  );
}
