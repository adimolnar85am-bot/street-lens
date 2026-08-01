"use client";

import Image, { type ImageProps } from "next/image";
import { PHOTO_ALT } from "@/lib/photos";
import { cn } from "@/lib/utils";

type Props = Omit<ImageProps, "alt"> & {
  alt?: string;
};

/**
 * Image with light copyright deterrence:
 * no context menu, no drag, no filename in alt.
 */
export function ProtectedImage({
  alt = PHOTO_ALT,
  className,
  draggable = false,
  ...props
}: Props) {
  return (
    <Image
      {...props}
      alt={alt}
      draggable={draggable}
      className={cn("select-none", className)}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    />
  );
}
