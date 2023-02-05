import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import PlottingService from "../../services/Plotting.service";

// Img
import Truck from "../../assets/truck.png";

function Path({ path, map, pathIndex }) {
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
      path[index].latitude,
      path[index].longitude,
      {
        latitude: path[index + (index == path.length - 1 ? 0 : 1)].latitude,
        longitude: path[index + (index == path.length - 1 ? 0 : 1)].longitude,
      },
      marker,
      pathIndex
    );
    // await sleep(1000);
    setMarker(tempMarker);
    setIndex(index + 1);
  };

  useEffect(() => {
    console.log("Hellooo");
    if (index >= path.length) return;
    plotOnMap();
  }, [index]);

  return <div ref={element} className="truck"></div>;
}

export default Path;
