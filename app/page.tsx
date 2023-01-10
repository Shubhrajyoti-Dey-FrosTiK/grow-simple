"use client";

import dynamic from "next/dynamic";
import { Button } from "../components/components";

export default function Home() {
  return (
    <main>
      <p className="text-2xl">Hello world</p>
      <Button>Page</Button>
    </main>
  );
}
