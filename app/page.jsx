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

import { clustering } from "../clustering/clustering";

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
  const WASM = useContext(WASMContext).wasm;
  const [originState, setOriginState] = useState([]);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [simulateHours, setSimulateHours] = useState(0);

  const tempHub = {
    latitude: 12.972442,
    longitude: 77.580643,
  };

  const [driverCoordinates, setDriverCoordinates] = useState([]);

  // const [roadSteps, setRoadSteps] = useState([]);

  const calculatePath = async (
    route,
    coordinateIndex,
    distanceMatrix,
    timeMatrix,
    riderMatrix
  ) => {
    clustering(
      {
        index: coordinateIndex,
        delivery_type: 1,
      },
      route,
      distanceMatrix,
      timeMatrix,
      riderMatrix.distanceMatrix
    );
  };

  const [originalPaths, setOriginalPaths] = useState([
    [
      {
        latitude: 12.972442,
        longitude: 77.580643,
      },
      {
        longitude: 77.5816906,
        latitude: 12.8927062,
      },
      {
        latitude: 12.972442,
        longitude: 77.580643,
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
        latitude: 12.972442,
        longitude: 77.580643,
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
      {
        latitude: 12.972442,
        longitude: 77.580643,
      },
    ],
  ]);

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
      {
        latitude: 12.972442,
        longitude: 77.580643,
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
        latitude: 12.972442,
        longitude: 77.580643,
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
      {
        latitude: 12.972442,
        longitude: 77.580643,
      },
    ],
  ]);

  const initialRequest = async (
    distanceMatrix,
    timeMatrix,
    originGeoInfo,
    tempOriginState
  ) => {
    const noOfRiders = Math.abs(Math.floor(tempOriginState.length / 25)) + 1;

    let routes = new Array(noOfRiders).fill({ nodes: [] });
    const newDriverCoordinates = [...driverCoordinates];

    if (!newDriverCoordinates.length) {
      for (let i = 0; i < noOfRiders; i++) {
        newDriverCoordinates.push(tempHub);
      }
    }

    setDriverCoordinates(newDriverCoordinates);

    let riderMatrix = await pds.batchDistanceMatrix(
      newDriverCoordinates,
      tempOriginState
    );

    const route = [];
    for (let i = 0; i < noOfRiders; i++)
      route.push({
        nodes: [],
      });

    // So here we will get a Array of Paths according to the driver datra
    await Promise.all(
      tempOriginState.map(async (coordinate, coordinateIndex) => {
        if (coordinateIndex) {
          await calculatePath(
            route,
            coordinateIndex,
            distanceMatrix,
            timeMatrix,
            riderMatrix
          );
        }
      })
    );

    // Now we need to convert the Node into the coordinates
    const tempPath = ps.indexToCoordinate(
      tempOriginState,
      route,
      paths,
      tempHub
    );

    // Set the path
    setPaths(tempPath);

    const roadSteps = [];
    tempPath.map(() => roadSteps.push([]));
    await Promise.all(
      // The path is getting passed which is the modified route. The previous deliveries are removed from the route
      tempPath.map(
        async (path, index) =>
          await handlePlotPath(path, roadSteps, index, true)
      )
    );
  };

  console.log(paths);

  const handlePlotPath = async (path, roadSteps, routeNo, plot) => {
    const tempPathSteps = await PLOTTER.route(
      map,
      [...path],
      roadSteps,
      routeNo,
      plot
    );
    // roadPoints.push(ps.roadPoints(path, tempPathSteps.steps));
    // ps.getRoadPointsDuration(tempPathSteps.steps, roadPoints);
  };

  const handleHourSimulate = async () => {
    setHasSimulated(true);
    const roadSteps = [];
    paths.map(() => roadSteps.push([]));
    await Promise.all(
      // The path is getting passed which is the modified route. The previous deliveries are removed from the route
      paths.map(
        async (path, index) => await handlePlotPath(path, roadSteps, index)
      )
    );

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

    // Calculating the time for n deliveries
    const nthDeliveryTime = {
      duration: simulateHours * 60,
    };

    setDeliveryCount(deliveryCount + simulateDeliveries);

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
          break;
        }
      }

      let tempPath = [
        smoothCoordinates[pathIndex][smoothCoordinates[pathIndex].length - 1],
      ];
      for (
        let tempIndex = stepIndex;
        tempIndex < roadPoints[pathIndex].length;
        tempIndex++
      ) {
        // tempPath.push(roadPoints[pathIndex][tempIndex]);
        tempPath.push(paths[pathIndex][tempIndex + 1]);
      }

      newPathForNextSimulation.push(tempPath);
    }

    setPaths(newPathForNextSimulation);
    await asyncSetPathArray(smoothCoordinates);
  };

  const handleExtract = async (updatedOrigins) => {
    PLOTTER.clearMarkers(map);
    setPathArray([]);
    setHasExtracted(true);

    // SET OF ORIGINS / PICKUPS
    const origin = updatedOrigins ? [] : ReduxPickDropContext.dropPoints;
    let tempOriginState = [...originState];

    // SET OF DESTINATIONS / DROPS
    const dest = ReduxPickDropContext.pickupPoints;

    let { originGeoInfo, destGeoInfo, hubGeoInfo } =
      await pds.batchGeoCoordinates(origin, dest);

    if (updatedOrigins) {
      originGeoInfo = updatedOrigins;
      tempOriginState = [...tempOriginState, ...destGeoInfo];

      setOriginState(tempOriginState);
    } else {
      tempOriginState = [tempHub, ...originGeoInfo, ...destGeoInfo];

      setOriginState([tempHub, ...originGeoInfo, ...destGeoInfo]);
    }

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

    const { distanceMatrix, timeMatrix } = await pds.batchDistanceMatrix(
      tempOriginState,
      tempOriginState
    );

    initialRequest(distanceMatrix, timeMatrix, originGeoInfo, tempOriginState);

    // const tempPathSteps = [];

    // initialRequest();

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

    // const roadSteps = [];
    // paths.map(() => roadSteps.push([]));
    // await Promise.all(
    //   // The path is getting passed which is the modified route. The previous deliveries are removed from the route
    //   paths.map(
    //     async (path, index) =>
    //       await handlePlotPath(path, roadSteps, index, true)
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
    setHasSimulated(true);
    const roadSteps = [];
    paths.map(() => roadSteps.push([]));
    await Promise.all(
      // The path is getting passed which is the modified route. The previous deliveries are removed from the route
      paths.map(
        async (path, index) => await handlePlotPath(path, roadSteps, index)
      )
    );

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

    // Calculating the time for n deliveries
    const nthDeliveryTime = await ps.calculateNDeliveryTime(
      roadPoints,
      newPaths,
      simulateDeliveries
    );

    setDeliveryCount(deliveryCount + simulateDeliveries);

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
          break;
        }
      }

      let tempPath = [
        smoothCoordinates[pathIndex][smoothCoordinates[pathIndex].length - 1],
      ];
      for (
        let tempIndex = stepIndex;
        tempIndex < roadPoints[pathIndex].length;
        tempIndex++
      ) {
        // tempPath.push(roadPoints[pathIndex][tempIndex]);
        tempPath.push(paths[pathIndex][tempIndex + 1]);
      }

      newPathForNextSimulation.push(tempPath);
    }

    setPaths(newPathForNextSimulation);
    await asyncSetPathArray(smoothCoordinates);
  };

  const handleDynamicPoints = () => {
    const updatedDriverState = [];

    paths.forEach((path) => {
      updatedDriverState.push(path[0]);
    });
    setDriverCoordinates(updatedDriverState);
    handleExtract(updatedDriverState);
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
      <div className="max-w-4xl m-auto">
        {/* <Button type="file"></Button> */}
        <Typography order={4}>Upload Data</Typography>
        <div className="flex flex-wrap gap-5">
          <FileInput drop={true} />
        </div>
        <div>
          <Typography order={4}>Preview Data</Typography>
          <DisplayCSV csv={ReduxPickDropContext.dropPoints} />
        </div>
        {ReduxPickDropContext.dropPoints.length ? (
          <Button className="mt-2 mb-2" onClick={() => handleExtract()}>
            Extract Data
          </Button>
        ) : (
          <></>
        )}
        <Typography order={5}>Visualizer</Typography>
        <div ref={mapContainer} className="map-container h-[50vh]"></div>
        <Typography order={5}>
          Total {deliveryCount} deliveries simulated
        </Typography>
        {pathArray.length ? (
          pathArray.map((path, pathIndex) => {
            return (
              <Path
                key={`Path_${pathIndex}`}
                path={path}
                map={map}
                smoothenedCoordinates={pathArray}
                pathIndex={pathIndex + 1}
              />
            );
          })
        ) : (
          <></>
        )}
        {hasExtracted && (
          <div>
            <TextInput
              value={simulateDeliveries}
              onChange={(e) => setSimulateDeliveries(Number(e.target.value))}
              type="number"
              label="Simulate no of deliveries"
              className="mt-3"
            />
            <Button className="mt-2 mb-2" onClick={handleOptimizedNDeliveries}>
              SIMULATE DELIVERIES
            </Button>

            <TextInput
              value={simulateHours}
              onChange={(e) => setSimulateHours(Number(e.target.value))}
              type="number"
              label="Simulate no of hours you want to simulate"
              className="mt-3"
            />
            <Button className="mt-2 mb-2" onClick={handleHourSimulate}>
              SIMULATE HOURS
            </Button>
          </div>
        )}
        {hasSimulated && (
          <div>
            <FileInput pick={true} />
            <DisplayCSV csv={ReduxPickDropContext.pickupPoints} pickup={true} />
            {ReduxPickDropContext.pickupPoints.length ? (
              <div>
                <Button onClick={handleDynamicPoints}>
                  Add dynamic pickup points
                </Button>
              </div>
            ) : (
              <></>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
