// @ts-nocheck
import { expose } from "threads/worker";
import { clustering } from "../clustering/clustering";

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}

const clusteringSW = (
  tempOriginState,
  route,
  distanceMatrix,
  timeMatrix,
  riderMatrix
) => {
  tempOriginState.map((coordinate, coordinateIndex) => {
    if (coordinateIndex) {
      clustering(
        {
          index: coordinateIndex,
          delivery_type: 1,
        },
        route,
        distanceMatrix,
        timeMatrix,
        transpose(riderMatrix.distanceMatrix)
      );
    }
    console.log(coordinateIndex);
  });

  return route;
};

expose({ clusteringSW });
