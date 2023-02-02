"use client";

import { Button, Typography } from "../components/components";
import DisplayCSV from "../components/displayCSV";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../firebase/useAuth";
import FileInput from "../components/input/FileInput";

// Map
import mapboxgl from "!mapbox-gl";

// Redux
import { useSelector } from "react-redux";
import { selectPickDrop } from "../store/states/pickDrop";

// Services
import { PickDropService } from "../services/PickDrop.service";
import PlottingService from "../services/Plotting.service";
import axios from "axios";

export default function Home() {
  // const { user, isSignedIn } = useAuth();

  const ReduxPickDropContext = useSelector(selectPickDrop);
  const pds = new PickDropService();
  const plot = new PlottingService();

  const mapContainer = useRef(null);
  const map = useRef(null);

  const [noOfDeliveryBoys, setNoOfDeliveryBoys] = useState(3);
  const [originGeoInfo, setOriginGeoInfo] = useState(3);
  const [destGeoInfo, setDestGeoInfo] = useState(3);

  const tempHub = {
    latitude: 12.972442,
    longitude: 77.580643,
  };

  const paths = [
    [
      {
        latitude: 12.972442,
        longitude: 77.580643,
      },
      {
        longitude: 77.5855952,
        latitude: 12.9128212,
      },
      {
        longitude: 77.5855952,
        latitude: 12.9128212,
      },
      {
        longitude: 77.5816906,
        latitude: 12.8927062,
      },
    ],
    [
      {
        latitude: 12.972442,
        longitude: 77.580643,
      },
      {
        longitude: 77.5454111,
        latitude: 12.9414398,
      },
    ],
    [
      {
        longitude: 77.577034,
        latitude: 12.9033477,
      },
      {
        longitude: 77.5454111,
        latitude: 12.9414398,
      },
    ],
  ];

  const handleExtract = async () => {
    const combinedData = pds.combine(
      ReduxPickDropContext.pickupPoints,
      ReduxPickDropContext.dropPoints
    );

    // SET OF ORIGINS / PICKUPS
    const origin = [
      ReduxPickDropContext.pickupPoints[0],
      ReduxPickDropContext.pickupPoints[1],
      ReduxPickDropContext.pickupPoints[2],
    ];

    // SET OF DESTINATIONS / DROPS
    const dest = [
      ReduxPickDropContext.dropPoints[0],
      ReduxPickDropContext.dropPoints[1],
    ];

    const { originGeoInfo, destGeoInfo, hubGeoInfo } =
      await pds.batchGeoCoordinates(origin, dest);

    console.log({
      originGeoInfo,
      destGeoInfo,
      hubGeoInfo,
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [originGeoInfo[0].longitude, originGeoInfo[0].latitude],
      zoom: 11,
    });

    plot.points(
      map,
      [tempHub, ...originGeoInfo, ...destGeoInfo],
      originGeoInfo.length
    );

    console.log([tempHub, ...originGeoInfo, ...destGeoInfo]);

    const distanceMatrix = await pds.batchDistanceMatrix(
      originGeoInfo,
      destGeoInfo
    );

    const pathSteps = [];
    paths.forEach((path, index) => {
      pathSteps.push(plot.route(map, [...path], index + 1));
    });

    console.log(distanceMatrix, pathSteps);
  };

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.5946, 12.9716],
      zoom: 10,
    });
  });

  return (
    <main>
      <div>
        {/* <Button type="file"></Button> */}
        <Typography order={4}>Upload Data</Typography>
        <div className="flex flex-wrap gap-5">
          <FileInput pick={true} />
          <FileInput drop={true} />
        </div>
        <div>
          <Typography order={4}>Preview Data</Typography>
          <DisplayCSV csv={ReduxPickDropContext.pickupPoints} pickup />
          <DisplayCSV csv={ReduxPickDropContext.dropPoints} />
        </div>
        <Button onClick={handleExtract}>Extract Data</Button>
        <div ref={mapContainer} className="map-container h-[50vh]"></div>
      </div>
    </main>
  );
}
