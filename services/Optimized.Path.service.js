import axios from "axios";
import { LIMIT } from "../constants/limit";
import OptimizedPlottingService from "./Optimized.Plotting.service";

export default class OptimizedPathService {
  PLOT = new OptimizedPlottingService();

  // FOR SPLITTING ARRAY INTO N PIECES (Rate limiter)
  splitToChunks(array, pieceLen) {
    let result = [];
    while (array.length) {
      result.push(array.splice(0, Math.min(array.length, pieceLen)));
    }
    return result;
  }

  async filterNDeliveries(paths, time) {
    const filteredDeliveries = [];

    paths.forEach((path) => {
      const tempDeliveries = [];
      for (let stepIndex = 0; stepIndex < path.length; stepIndex++) {
        if (!path[stepIndex].duration || path[stepIndex].duration <= time) {
          tempDeliveries.push(path[stepIndex]);
        } else break;
      }

      filteredDeliveries.push(tempDeliveries);
    });

    return filteredDeliveries;
  }

  async getDistanceMatrix(
    originGeoInfo,
    destGeoInfo,
    distanceMatrix,
    timeMatrix,
    len
  ) {
    const payload = { sources: [], targets: [], costing: "auto" };

    originGeoInfo.forEach((coordinate) => {
      payload.sources.push({
        lat: coordinate.latitude,
        lon: coordinate.longitude,
      });
    });

    destGeoInfo.forEach((coordinate) => {
      payload.targets.push({
        lat: coordinate.latitude,
        lon: coordinate.longitude,
      });
    });

    const distanceMatrixResponse = await axios.post(
      process.env.NEXT_PUBLIC_DISTANCE_MATRIX_API +
        "?json=" +
        JSON.stringify(payload)
    );

    distanceMatrixResponse.data.sources_to_targets.forEach(
      (path, pathIndex) => {
        path.forEach((step, stepIndex) => {
          distanceMatrix[pathIndex][stepIndex] = step.distance;
          timeMatrix[pathIndex][stepIndex] = step.time;
        });
      }
    );
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Batch Process Distance Matrix
  async batchDistanceMatrix(og, dg) {
    const originGeoInfo = [...og];
    const destGeoInfo = [...dg];
    const destBatch = this.splitToChunks(
      [...destGeoInfo],
      LIMIT.DISTANCE_MATRIX / originGeoInfo.length
    );

    const distanceMatrix = [];
    const timeMatrix = [];

    // Create the rows
    for (let i = 0; i < destGeoInfo.length; i++) {
      const tempDmCols = [];
      for (let j = 0; j < originGeoInfo.length; j++) {
        tempDmCols.push(null);
      }
      distanceMatrix.push([...tempDmCols]);
      timeMatrix.push([...tempDmCols]);
    }

    // Populate all the rows
    // Promise.raceAll = () => {
    //   return Promise.all(
    //     destBatch.map(async (dest, index) => {
    //       console.log("Distance Matrix:", index);
    //       return Promise.race([
    //         await this.getDistanceMatrix(
    //           originGeoInfo,
    //           dest,
    //           distanceMatrix,
    //           timeMatrix,
    //           Math.floor(index * (LIMIT.DISTANCE_MATRIX / originGeoInfo.length))
    //         ),
    //         await this.sleep(10000),
    //       ]);
    //     })
    //   );
    // };

    // destBatch.map(async (dest, index) => {
    //   await Promise.all(async () => {
    //     await this.getDistanceMatrix(
    //       originGeoInfo,
    //       dest,
    //       distanceMatrix,
    //       timeMatrix,
    //       Math.floor(index * (LIMIT.DISTANCE_MATRIX / originGeoInfo.length))
    //     );

    //     await this.sleep(10000);
    //     console.log("Distance Matrix: " + index);
    //   });
    // });

    for (let i = 0; i < destBatch.length; i++) {
      await this.getDistanceMatrix(
        originGeoInfo,
        destBatch[i],
        distanceMatrix,
        timeMatrix,
        Math.floor(i * (LIMIT.DISTANCE_MATRIX / originGeoInfo.length))
      );
      console.log("Distance Matrix: " + i);
      await this.sleep(5000);
    }

    return { distanceMatrix, timeMatrix };
  }
}
