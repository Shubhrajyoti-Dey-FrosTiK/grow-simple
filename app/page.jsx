"use client";

import { Button, TextInput, Typography } from "../components/components";
import DisplayCSV from "../components/displayCSV";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../firebase/useAuth";
import FileInput from "../components/input/FileInput";

// Map
import mapboxgl from "!mapbox-gl";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { selectPickDrop } from "../store/states/pickDrop";

// Services
import { PickDropService } from "../services/PickDrop.service";
import PlottingService from "../services/Plotting.service";
import SimulationService from "../services/Simulation.service";
import PathService from "../services/Path.service";
import axios from "axios";

// Components
import Path from "../components/map/Path";
import { selectSimulation, trigger } from "../store/states/simulation";

export default function Home() {
  // const { user, isSignedIn } = useAuth();
  const dispatch = useDispatch();
  const ReduxPickDropContext = useSelector(selectPickDrop);
  const pds = new PickDropService();
  const plot = new PlottingService();
  const simulate = new SimulationService();
  const ps = new PathService();

  const mapContainer = useRef(null);
  const map = useRef(null);

  const play = useSelector(selectSimulation);
  const [time, setTime] = useState(0);
  const [pathArray, setPathArray] = useState([]);
  const [deliveryCount, setDeliveryCount] = useState(0);
  const [simulateDeliveries, setSimulateDeliveries] = useState(1);
  const [pathCovered, setPathCovered] = useState([]);
  const [lastPoints, setLastPoints] = useState([]);

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
      {
        longitude: 77.5855952,
        latitude: 12.9128212,
      },
      {
        longitude: 77.58592415,
        latitude: 12.89807825,
      },
      {
        longitude: 77.577034,
        latitude: 12.9033477,
      },
      {
        longitude: 77.5454111,
        latitude: 12.9414398,
      },
    ],
    [
      {
        latitude: 12.972442,
        longitude: 77.580643,
      },

      {
        longitude: 77.58574563,
        latitude: 12.91249464,
      },
      {
        longitude: 77.5454111,
        latitude: 12.9414398,
      },
      {
        longitude: 77.5728281,
        latitude: 12.8818289,
      },
      {
        longitude: 77.58827011,
        latitude: 12.89823678,
      },
    ],
  ];

  const handlePlotPath = async (
    path,
    index,
    pathSteps,
    roadPoints,
    plotRoute
  ) => {
    const tempPathSteps = await plot.route(
      map,
      [...path],
      index + 1,
      plotRoute
    );
    pathSteps.push(tempPathSteps);
    roadPoints.push(ps.roadPoints(path, tempPathSteps.steps));
  };

  const handleExtract = async () => {
    setPathArray([]);

    // SET OF ORIGINS / PICKUPS
    const origin = ReduxPickDropContext.pickupPoints;

    // SET OF DESTINATIONS / DROPS
    const dest = ReduxPickDropContext.dropPoints;

    const { originGeoInfo, destGeoInfo, hubGeoInfo } =
      await pds.batchGeoCoordinates(origin, dest);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: ps.getAverageCoordinates(originGeoInfo, destGeoInfo),
      zoom: 11,
    });

    // This will plot the markers
    plot.points(
      map,
      [tempHub, ...originGeoInfo, ...destGeoInfo],
      originGeoInfo.length
    );

    plot.setTraffic(map);

    console.log([tempHub, ...originGeoInfo, ...destGeoInfo]);

    const distanceMatrix = await pds.batchDistanceMatrix(
      originGeoInfo,
      destGeoInfo
    );

    const tempPathSteps = [];

    // This will store the road version of the origin destination points
    const tempRoadPoints = [];

    await Promise.all(
      paths.map(
        async (path, index) =>
          await handlePlotPath(path, index, tempPathSteps, tempRoadPoints, true)
      )
    );
  };

  const handleDeliveries = async () => {
    // This will store the geometry and legs of all the routes
    const pathSteps = [];

    // This will store the road version of the origin destination points
    const roadPoints = [];

    let newPath = [];

    if (lastPoints.length && pathCovered.length) {
      // This means that there has been a simulation earlier
      // So this will not trigger in the first simulation

      // First place the starting point
      pathCovered.forEach((path, pathIndex) => {
        if (path.length === paths[pathIndex].length || !lastPoints[pathIndex]) {
          // Then the whole path is covered
          newPath.push([]);
        } else {
          // The whole path is not covered so push the last position of the driver
          newPath.push([lastPoints[pathIndex]]);
        }

        // Now push the rest
        for (
          let stepIndex = path.length;
          stepIndex < paths[pathIndex].length;
          stepIndex++
        ) {
          // This will not trigger if path.length  === paths[pathIndex].length  or the path is covered
          newPath[pathIndex].push(paths[pathIndex][stepIndex]);
        }
      });
    } else newPath = paths;

    console.log(newPath);

    await Promise.all(
      // The path is getting passed which is the modified route. The previous deliveries are removed from the route
      newPath.map(
        async (path, index) =>
          await handlePlotPath(path, index, pathSteps, roadPoints, false)
      )
    );

    // Calculating the time for n deliveries
    const nthDeliveryTime = ps.calculateNDeliveryTime(
      roadPoints,
      simulateDeliveries
    ).duration;

    setDeliveryCount(deliveryCount + simulateDeliveries);

    setTime(nthDeliveryTime);

    // Filtering out the route and removing the route which cannot be traversed in the n delivery time
    const filteredDeliveryRouteForNDeliveries = ps.filterNDeliveries(
      pathSteps,
      nthDeliveryTime
    );

    // Enumerating the filtered route with smoothened coordinate for animation
    const smoothCoordinates = ps.smoothenCoordinates(
      filteredDeliveryRouteForNDeliveries,
      nthDeliveryTime
    );
    // Now adding the last node if smoothCoordinates have no elements -> The path is covered
    smoothCoordinates.forEach((path, pathIndex) => {
      if (!path.length) {
        path.push(lastPoints[pathIndex]);
        path.push(lastPoints[pathIndex]);
      }
    });
    setPathArray(smoothCoordinates);

    // Calculating the path which will be covered in this n delivery simulation
    const pointsToBeCovered = ps.getPointsToBeCovered(
      roadPoints,
      paths,
      nthDeliveryTime,
      pathCovered
    );
    setPathCovered(pointsToBeCovered);

    // Storing the coordinates of each rider after n deliveries
    const tempLastCoordinates = [];
    smoothCoordinates.forEach((coordinatesArray) => {
      tempLastCoordinates.push(coordinatesArray[coordinatesArray.length - 1]);
    });
    setLastPoints(tempLastCoordinates);

    console.log(paths, pointsToBeCovered);
  };

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [10, 10],
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
            return (
              <Path
                key={`Path_${pathIndex}`}
                path={path}
                map={map}
                pathIndex={pathIndex + 1}
              />
            );
          })}
      </div>
      <TextInput
        value={simulateDeliveries}
        onChange={(e) => setSimulateDeliveries(Number(e.target.value))}
        type="number"
      />
      <Button onClick={handleDeliveries}>SIMULATE</Button>
    </main>
  );
}
