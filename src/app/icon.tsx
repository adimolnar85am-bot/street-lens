import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export const runtime = "edge";
export const contentType = "image/png";

export const size = {
  width: 32,
  height: 32,
};

export default function Icon() {
  return new ImageResponse(<BrandMark size={32} />, { ...size });
}
