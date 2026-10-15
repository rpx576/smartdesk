"use client";

import Image, { type ImageLoader } from "next/image";
import type { CoverImage as Cover } from "./articles";

/** Unsplash's CDN crops and resizes, so next/image only has to pick the width. */
const unsplashLoader: ImageLoader = ({ src, width, quality }) =>
  `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${width}&q=${quality ?? 70}`;

type Props = { image: Cover; sizes: string; preload?: boolean; className?: string };

/** Cover photo that fills its (relative) parent. */
export function CoverImage({ image, sizes, preload, className }: Props) {
  return (
    <Image
      loader={unsplashLoader}
      src={image.id}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={preload}
      className={className}
    />
  );
}
