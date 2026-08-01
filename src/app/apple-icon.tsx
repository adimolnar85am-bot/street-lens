import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 180, height: 180 };

export default function AppleIcon() {
  return new ImageResponse(<BrandMark size={180} />, { ...size });
}
