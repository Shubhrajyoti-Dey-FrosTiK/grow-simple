"use client";

import dynamic from "next/dynamic";
import { Button } from "../components/components";
import WebcamCapture from "../components/WebcamCapture";
import GoogleMap from "../components/googleMap";

export default function Home() {
  return (
    <main>
      <p className="text-2xl">Hello World</p>
      <Button>Page</Button>
      {/* <WebcamCapture /> */}
      <GoogleMap />
    </main>
  );
}
