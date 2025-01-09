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
    key: "onepiece",
    display: "OnePiece",
  },
  {
    key: "naruto",
    display: "Naruto",
  },
  {
    key: "bleach",
    display: "Bleach",
  },
];

type HomeProps = {
  onePiece: Photo[];
  naruto: Photo[];
  bleach: Photo[];
};

const fetchPinterestImages = async (query: string): Promise<Photo[]> => {
  const response = await fetch(`https://api.pinterest.com/v1/search/pins/?query=${query}&access_token=${process.env.PINTEREST_ACCESS_TOKEN}`);
  const data = await response.json();

  if (!data || !data.data) {
    console.error(`Failed to fetch Pinterest images for query: ${query}`);
    return [];
  }

  return data.data.map((item: any) => ({
    id: item.id,
    url: item.image.original.url,
    likes: item.like_count,
  }));
};

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY!,
    fetch: nodeFetch as unknown as typeof fetch,
  });

  const [onePieceUnsplash, narutoUnsplash, bleachUnsplash] = await Promise.all([
    getImages(unsplash, "one piece"),
    getImages(unsplash, "naruto"),
    getImages(unsplash, "bleach"),
  ]);

  const [onePiecePinterest, narutoPinterest, bleachPinterest] = await Promise.all([
    fetchPinterestImages("one piece"),
    fetchPinterestImages("naruto"),
    fetchPinterestImages("bleach"),
  ]);

  const onePiece = [...onePieceUnsplash, ...onePiecePinterest];
  const naruto = [...narutoUnsplash, ...narutoPinterest];
  const bleach = [...bleachUnsplash, ...bleachPinterest];

  return {
    props: {
      onePiece,
      naruto,
      bleach,
    },
    // revalidate: 10,    uncomment for ISR
  };
};

export default function Home({ onePiece, naruto, bleach }: HomeProps) {
  const allPhotos = useMemo(() => {
    const all = [...onePiece, ...naruto, ...bleach];

    return all.sort((a, b) => b.likes - a.likes);
  }, [onePiece, naruto, bleach]);

  return (
    <div>
      {/* Head component */}
      <Head>
        <title>Anime photography Website</title>
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
          <span className="uppercase text-lg font-medium">Anime Photography Website</span>
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
                <Gallery photos={onePiece} />
              </TabPanel>
              <TabPanel>
                <Gallery photos={naruto} />
              </TabPanel>
              <TabPanel>
                <Gallery photos={bleach} />
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
