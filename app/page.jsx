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
import SimulationService from "../services/Simulation.service";
import PathService from "../services/Path.service";
import axios from "axios";

// Components
import Path from "../components/map/Path";

export default function Home() {
  // const { user, isSignedIn } = useAuth();

  const ReduxPickDropContext = useSelector(selectPickDrop);
  const pds = new PickDropService();
  const plot = new PlottingService();
  const simulate = new SimulationService();
  const ps = new PathService();

  const mapContainer = useRef(null);
  const map = useRef(null);

  const [noOfDeliveryBoys, setNoOfDeliveryBoys] = useState(3);
  const [originGeoInfo, setOriginGeoInfo] = useState(3);
  const [time, setTime] = useState(0);
  const [pathArray, setPathArray] = useState([]);

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

  const handlePlotPath = async (path, index, pathSteps, roadPoints) => {
    const tempPathSteps = await plot.route(map, [...path], index + 1);
    pathSteps.push(tempPathSteps);
    roadPoints.push(ps.roadPoints(path, tempPathSteps.steps));
  };

  const handleExtract = async () => {
    setPathArray([]);

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

    // This will plot the markers
    plot.points(
      map,
      [tempHub, ...originGeoInfo, ...destGeoInfo],
      originGeoInfo.length
    );

    plot.setTraffic(map);

    const distanceMatrix = await pds.batchDistanceMatrix(
      originGeoInfo,
      destGeoInfo
    );

    // This will store the geometry and legs of all the routes
    const pathSteps = [];

    // This will store the road version of the origin destination points
    const roadPoints = [];

    await Promise.all(
      paths.map(
        async (path, index) =>
          await handlePlotPath(path, index, pathSteps, roadPoints)
      )
    );
    setPathArray(pathSteps);

    setTime(ps.calculateNDeliveryTime(roadPoints, 1).duration);
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
        {pathArray.length &&
          pathArray.map((path, pathIndex) => {
            return <Path key={`Path_${pathIndex}`} path={path} map={map} />;
          })}
      </div>
    </main>
  );
}
