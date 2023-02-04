import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import PlottingService from "../../services/Plotting.service";

// Img
import Truck from "../../assets/truck.png";

function Path({ path, map }) {
  const plot = new PlottingService();
  const element = useRef(null);
  const [marker, setMarker] = useState();
  const [index, setIndex] = useState(0);

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const plotOnMap = async () => {
    const tempMarker = await plot.pathPinPoint(
      map,
      path.route[index][1],
      path.route[index][0],
      marker
    );
    await sleep(1000);
    setMarker(tempMarker);
    setIndex(index + 1);
  };

  useEffect(() => {
    console.log("Hellooo");
    if (index >= path.route.length) return;
    plotOnMap();
  }, [index]);

  return <div ref={element} className="truck"></div>;
}

export default Path;
