import { getDistance, getPreciseDistance } from "geolib";

export default class PathService {
  roadPoints(locationArray, list) {
    let roadPointsArray = [];

    // Enumerate
    for (let i = 0; i < locationArray.length; i++) roadPointsArray.push({});

    // Populate
    locationArray.map((location, index) => {
      let duration = 0;
      let distance = 1e7;
      list.map((step) => {
        let stepDistance = 0;
        // In each step check the coordinates
        step.geometry.coordinates.map((coordinate, coordinateIndex) => {
          // Calcu"4ate the distance between 2 coordinates

          const tempDistance = getDistance(location, {
            longitude: coordinate[0],
            latitude: coordinate[1],
          });

          if (coordinateIndex)
            stepDistance += getDistance(
              {
                longitude: coordinate[0],
                latitude: coordinate[1],
              },
              {
                longitude: step.geometry.coordinates[coordinateIndex - 1][0],
                latitude: step.geometry.coordinates[coordinateIndex - 1][1],
              }
            );

          // Finding out the closest point in the path to that coordinate
          if (tempDistance < distance) {
            distance = tempDistance;

            // We are calculating the duration by checking the proportion of the distance to the total distance of the steps
            roadPointsArray[index] = {
              longitude: coordinate[0],
              latitude: coordinate[1],
              duration:
                duration + (stepDistance / step.distance) * step.duration,
            };
          }
        });

        // Update the duration
        duration += step.duration;
      });
    });

    return roadPointsArray;
  }

  async calculateNDeliveryTime(roadPointsArray, newPathArray, n) {
    console.log(roadPointsArray);
    let completeRoadPointsArray = [];
    roadPointsArray.forEach((roadPoints, pathIndex) => {
      if (newPathArray[pathIndex].length > 1)
        completeRoadPointsArray = [...completeRoadPointsArray, ...roadPoints];
    });

    completeRoadPointsArray.sort((a, b) => {
      if (a.duration < b.duration) return -1;
      if (a.duration > b.duration) return 1;
      return 0;
    });

    console.log(completeRoadPointsArray);
    return completeRoadPointsArray[n - 1];
  }

  getCoordinateInTTime(coordinate1, coordinate2, t1, t2, t3) {
    const latitude =
      (coordinate1.latitude * (t2 - t3) + coordinate2.latitude * (t3 - t1)) /
      (t2 - t1);

    const longitude =
      (coordinate1.longitude * (t2 - t3) + coordinate2.longitude * (t3 - t1)) /
      (t2 - t1);

    return {
      latitude,
      longitude,
    };
  }

  getNCoordinates = (start, end, n) => {
    let result = [];
    n--;
    for (let w = 0; w <= n; w++)
      result.push({
        latitude: ((n - w) * start.latitude + w * end.latitude) / n,
        longitude: ((n - w) * start.longitude + w * end.longitude) / n,
      });
    return result;
  };

  // StepInfo -> Array<Path> -> Path -> Array<Steps> -> Step -> Array<Coordinates>

  filterNDeliveries(stepsInfo, time) {
    // First we need to create an array of all the coordinates of a path along with time
    const coordinatesArray = [];

    stepsInfo.forEach((path) => {
      const pathCoordinates = [];
      // This is calculated per path
      let duration = 0;

      // Iterate over the each path
      for (let stepIndex = 0; stepIndex < path.steps.length; stepIndex++) {
        // This is calculated per step
        let stepDistance = 0;
        let done = false;

        for (
          let coordinateIndex = 0;
          coordinateIndex < path.steps[stepIndex].geometry.coordinates.length;
          coordinateIndex++
        ) {
          let legDistance = 0;
          // Finding out the distance covered to that of the total distance which is needed to be covered
          if (coordinateIndex > 0) {
            // If it has covered any distance then add it to the distance
            legDistance = getPreciseDistance(
              {
                longitude:
                  path.steps[stepIndex].geometry.coordinates[
                    coordinateIndex - 1
                  ][0],
                latitude:
                  path.steps[stepIndex].geometry.coordinates[
                    coordinateIndex - 1
                  ][1],
              },
              {
                longitude:
                  path.steps[stepIndex].geometry.coordinates[
                    coordinateIndex
                  ][0],
                latitude:
                  path.steps[stepIndex].geometry.coordinates[
                    coordinateIndex
                  ][1],
              }
            );
          }
          stepDistance += legDistance;
          // At this state we have the distance covered with us
          // Now calculate the duration
          const legDuration =
            path.steps[stepIndex].duration *
            (stepDistance / path.steps[stepIndex].distance);

          // console.log(duration + legDuration, time);

          if (duration + legDuration <= time) {
            pathCoordinates.push({
              longitude:
                path.steps[stepIndex].geometry.coordinates[coordinateIndex][0],
              latitude:
                path.steps[stepIndex].geometry.coordinates[coordinateIndex][1],
              duration: duration + legDuration,
            });
          } else {
            if (coordinateIndex)
              pathCoordinates.push({
                ...this.getCoordinateInTTime(
                  {
                    longitude:
                      path.steps[stepIndex].geometry.coordinates[
                        coordinateIndex - 1
                      ][0],
                    latitude:
                      path.steps[stepIndex].geometry.coordinates[
                        coordinateIndex - 1
                      ][1],
                  },
                  {
                    longitude:
                      path.steps[stepIndex].geometry.coordinates[
                        coordinateIndex
                      ][0],
                    latitude:
                      path.steps[stepIndex].geometry.coordinates[
                        coordinateIndex
                      ][1],
                  },
                  duration,
                  duration + legDuration,
                  time
                ),
                duration: time,
              });
            done = true;
            break;
          }
        }

        if (done) break;
        duration += path.steps[stepIndex].duration;
      }
      coordinatesArray.push(pathCoordinates);
    });

    return coordinatesArray;
  }

  async smoothenCoordinates(nCoordinatesArray, time) {
    const smoothCoordinates = [];
    nCoordinatesArray.forEach((coordinatesArray) => {
      let coordinates = [];
      if (coordinatesArray.length == 1) coordinates = coordinatesArray;

      for (
        let coordinateIndex = 1;
        coordinateIndex < coordinatesArray.length;
        coordinateIndex++
      ) {
        const duration = Math.abs(
          coordinatesArray[coordinateIndex].duration -
            coordinatesArray[coordinateIndex - 1].duration
        );

        const noOfElements = (2500 / time) * duration;

        coordinates = [
          ...coordinates,
          ...this.getNCoordinates(
            coordinatesArray[coordinateIndex - 1],
            coordinatesArray[coordinateIndex],
            Math.max(noOfElements, 2)
          ),
        ];
      }
      smoothCoordinates.push(coordinates);
    });

    return smoothCoordinates;
  }

  getPointsToBeCovered(roadPointsArray, normalPath, nthTime, pathCovered) {
    const pointsToBeCoveredArray = [...pathCovered];
    const pointsLen = pointsToBeCoveredArray.length;

    // Prepare
    if (pointsLen < roadPointsArray.length) {
      for (let i = 0; i < roadPointsArray.length - pointsLen; i++) {
        pointsToBeCoveredArray.push([]);
      }
    }

    // At this point pointsToBeCoveredArray will have Array<Array<Coordinate>> or just Array of p empty arrays

    // Taking a copy to snapshot the state Length
    const lenOfPathToBeCovered = [];

    pointsToBeCoveredArray.forEach((path) =>
      lenOfPathToBeCovered.push(path.length)
    );

    // Populate
    for (let pathIndex = 0; pathIndex < roadPointsArray.length; pathIndex++) {
      // for (
      //   let stepIndex = 0;
      //   stepIndex < roadPointsArray[pathIndex].length;
      //   stepIndex++
      // ) {
      //   if (roadPointsArray[pathIndex][stepIndex].duration <= nthTime) {
      //     pointsToBeCoveredArray[pathIndex].push(
      //       normalPath[pathIndex][stepIndex]
      //     );
      //   } else break;
      // }

      if (
        pointsToBeCoveredArray[pathIndex].length < normalPath[pathIndex].length
      ) {
        // Coming inside this point means that there is still some points to cover
        let startIndex = 0;

        // If there already exists some path before then we need to omit the first point as that point will be the point after n deliveries
        if (pointsToBeCoveredArray[pathIndex].length) startIndex++;

        // Now we need to iterate over roadPointsArray to check which points to include in this n deliveries
        // We need to understand that roadPointsArray is the point on the road. So we need to take the normalPath point of the roadPoint in order to maintain uniformity over API calls

        for (
          let stepIndex = startIndex;
          stepIndex < roadPointsArray[pathIndex].length;
          stepIndex++
        ) {
          if (roadPointsArray[pathIndex][stepIndex].duration <= nthTime) {
            // This means that this point will be covered in this simulation. So add this to points to be covered
            pointsToBeCoveredArray[pathIndex].push(
              normalPath[pathIndex][
                lenOfPathToBeCovered[pathIndex] + stepIndex - startIndex
              ]
            );
          }

          // Here we have done copyOfPointsToBeCoveredArray[pathIndex].length + stepIndex in order to maintain the index
          // copyOfPointsToBeCoveredArray will have the covered points in the last simulation
          // If this is the first simulation  then length will be zero thus not affecting the index
        }
      }
    }

    return pointsToBeCoveredArray;
  }

  getAverageCoordinates(origin, dest) {
    let lat = 0;
    let lng = 0;

    origin.forEach((p) => {
      lat += p.latitude;
      lng += p.longitude;
    });
    dest.forEach((p) => {
      lat += p.latitude;
      lng += p.longitude;
    });

    const len = origin.length + dest.length;
    return [lng / len, lat / len];
  }
}
