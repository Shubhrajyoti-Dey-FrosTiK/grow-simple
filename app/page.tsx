"use client";

import dynamic from "next/dynamic";
import { Button } from "../components/components";
import { useEffect } from "react";
import { check } from "../firebase/auth";
import { auth } from "../firebase/firebase";
import { useAuth } from "../firebase/useAuth";
import FileInput from "../components/input/FileInput";

// Redux
import { useSelector } from "react-redux";
import { selectPickDrop } from "../store/states/pickDrop";

// Services
import { PickDropService } from "../services/PickDrop.service";

export default function Home() {
  const { user, isSignedIn } = useAuth();

  const ReduxPickDropContext = useSelector(selectPickDrop);
  const pds = new PickDropService();

  const handleExtract = () => {
    const combinedData = pds.combine(
      ReduxPickDropContext.pickupPoints,
      ReduxPickDropContext.dropPoints
    );

    console.log(combinedData);
  };

  useEffect(() => {
    // if (user) check();
  }, [user]);

  return (
    <main>
      <p className="text-2xl">Hello world</p>
      <h1>{isSignedIn ? "Signed In" : "Not Signed In"}</h1>
      {/* <Button type="file"></Button> */}
      <FileInput pick={true} />
      <FileInput drop={true} />
      <Button onClick={handleExtract}>Extract Data</Button>
    </main>
  );
}
