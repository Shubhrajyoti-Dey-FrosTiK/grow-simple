"use client";

import { Button, TextInput, Typography } from "../components/components";
import DisplayCSV from "../components/displayCSV";
import { useEffect, useRef, useState } from "react";
import FileInput from "../components/input/FileInput";

// Map
import mapboxgl from "!mapbox-gl";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { selectPickDrop } from "../store/states/pickDrop";

// Services
import { PickDropService } from "../services/PickDrop.service";
import PlottingService from "../services/Plotting.service";
import OptimizedPlottingService from "../services/Optimized.Plotting.service";
import SimulationService from "../services/Simulation.service";
import PathService from "../services/Path.service";
import OptimizedPathService from "../services/Optimized.Path.service";

// Components
import Path from "../components/map/Path";
import { selectSimulation, trigger } from "../store/states/simulation";
import { WASMTest } from "../components/WASMTest.tsx";
import { Node, DeliveryType, Route } from "./types.ts";

import { useContext } from "react";

import { WASMContext } from "../wasmContext";

export default function Home() {
  // const { user, isSignedIn } = useAuth();
  const dispatch = useDispatch();
  const ReduxPickDropContext = useSelector(selectPickDrop);
  const pds = new PickDropService();
  const plot = new PlottingService();
  const OPS = new OptimizedPathService();
  const PLOTTER = new OptimizedPlottingService();
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
  const [globalDistanceMatrix, setGlobalDistanceMatrix] = useState([[]]);
  const WASMContext = useContext(WASMContext);
  
  // const [roadSteps, setRoadSteps] = useState([]);

  const tempHub = {
    latitude: 12.972442,
    longitude: 77.580643,
  };
  
  const numberOfRiders = 5;

  const initialRequest = () => {
    let routes = new Array(numberOfRiders).fill(null);

    let node = {
      delivery_type: 2,
      index: 1
    }
    WASMContext.ctx.invoke_clustering_from_js(routes, node, distanceMatrix, )
  }
  
  const [paths, setPaths] = useState([
    [
      {
        latitude: 12.972442,
        longitude: 77.580643,
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
        latitude: 12.972442,
        longitude: 77.580643,
      },
      {
        longitude: 77.5454111,
        latitude: 12.9414398,
      },
      {
        longitude: 77.5855952,
        latitude: 12.9128212,
      },
      {
        longitude: 77.5454111,
        latitude: 12.9414398,
      },
    ],
  ]);

  const handlePlotPath = async (path, roadSteps, routeNo) => {
    const tempPathSteps = await PLOTTER.route(
      map,
      [...path],
      roadSteps,
      routeNo
    );
    // roadPoints.push(ps.roadPoints(path, tempPathSteps.steps));
    // ps.getRoadPointsDuration(tempPathSteps.steps, roadPoints);
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

    const distanceMatrix = await pds.batchDistanceMatrix(
      [tempHub, ...originGeoInfo],
      [tempHub, ...destGeoInfo]
    );
    console.log(distanceMatrix);
    setGlobalDistanceMatrix(distanceMatrix);
    // const tempPathSteps = [];

    // // This will store the road version of the origin destination points
    // const tempRoadPoints = [];

    // await Promise.all(
    //   paths.map(
    //     async (path, index) =>
    //       await handlePlotPath(path, index, tempPathSteps, tempRoadPoints, true)
    //   )
    // );

    // const tempRoadSteps = [];
    // await Promise.all(
    //   // The path is getting passed which is the modified route. The previous deliveries are removed from the route
    //   paths.map(
    //     async (path, index) =>
    //       await handlePlotPath(path, tempRoadSteps, index + 1)
    //   )
    // );

    // setRoadSteps(tempRoadSteps);
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
  };

  const asyncSetPathArray = async (smoothCoordinates) => {
    setPathArray(smoothCoordinates);
  };

  const handleOptimizedNDeliveries = async () => {
    const roadSteps = [];
    paths.map(() => roadSteps.push([]));
    await Promise.all(
      // The path is getting passed which is the modified route. The previous deliveries are removed from the route
      paths.map(
        async (path, index) => await handlePlotPath(path, roadSteps, index)
      )
    );

    console.log(roadSteps);

    const newPaths = [];
    roadSteps.forEach((roadStep) => {
      let tempPath = [];
      let roadStepDuration = 0;
      roadStep.forEach((steps) => {
        steps.forEach((step) => {
          // Fixing the time
          tempPath.push({
            ...step,
            duration: roadStepDuration + step.duration,
          });
        });

        roadStepDuration += steps[steps.length - 1].duration;
      });
      newPaths.push(tempPath);
    });

    // Calculate the roadPoints
    const roadPoints = [];
    roadSteps.forEach((roadStep) => {
      const tempRoadPoints = [];
      let tempTime = 0;
      roadStep.forEach((step) => {
        tempRoadPoints.push({
          ...step[step.length - 1],
          duration: tempTime + step[step.length - 1].duration,
        });
        tempTime += step[step.length - 1].duration;
      });
      roadPoints.push(tempRoadPoints);
    });

    console.log(roadPoints);

    // Calculating the time for n deliveries
    const nthDeliveryTime = await ps.calculateNDeliveryTime(
      roadPoints,
      simulateDeliveries
    );

    // Filtering out the route and removing the route which cannot be traversed in the n delivery time
    const filteredDeliveryRouteForNDeliveries = await OPS.filterNDeliveries(
      newPaths,
      nthDeliveryTime.duration
    );

    // Enumerating the filtered route with smoothened coordinate for animation
    const smoothCoordinates = await ps.smoothenCoordinates(
      filteredDeliveryRouteForNDeliveries,
      nthDeliveryTime.duration
    );

    console.log(roadPoints.length);

    // Preparing for the next simulation
    const newPathForNextSimulation = [];
    for (let pathIndex = 0; pathIndex < roadPoints.length; pathIndex++) {
      let stepIndex = 0;

      for (
        stepIndex = 0;
        stepIndex < roadPoints[pathIndex].length;
        stepIndex++
      ) {
        if (
          roadPoints[pathIndex][stepIndex].duration > nthDeliveryTime.duration
        ) {
          console.log(
            roadPoints[pathIndex][stepIndex].duration,
            nthDeliveryTime.duration,
            pathIndex
          );
          break;
        }
      }

      // console.log(stepIndex);

      let tempPath = [];
      console.log(stepIndex, pathIndex);
      if (stepIndex < roadPoints[pathIndex].length) {
        if (smoothCoordinates[pathIndex].length)
          tempPath = [
            smoothCoordinates[pathIndex][
              smoothCoordinates[pathIndex].length - 1
            ],
          ];
        for (
          let tempIndex = stepIndex;
          tempIndex < roadPoints[pathIndex].length;
          tempIndex++
        ) {
          tempPath.push(roadPoints[pathIndex][tempIndex]);
        }
      } else {
        tempPath = [roadPoints[pathIndex][roadPoints[pathIndex].length - 1]];
      }

      newPathForNextSimulation.push(tempPath);
    }

    console.log(newPathForNextSimulation, paths, roadPoints);
    setPaths(newPathForNextSimulation);
    await asyncSetPathArray(smoothCoordinates);
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
      <Button onClick={handleOptimizedNDeliveries}>SIMULATE</Button>
      <WASMTest />
    </main>
  );
}
