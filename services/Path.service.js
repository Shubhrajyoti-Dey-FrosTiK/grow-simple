import { getDistance } from "geolib";

export default class PathService {
  roadPoints(locationArray, list) {
    let roadPointsArray = [];

    // Enumerate
    for (let i = 0; i < locationArray.length; i++) roadPointsArray.push({});

    let duration = 0;

    // Populate
    locationArray.map((location, index) => {
      let distance = 1e7;
      list.map((step) => {
        let stepDistance = 0;
        // In each step check the coordinates
        step.geometry.coordinates.map((coordinate, coordinateIndex) => {
          // Calculate the distance between 2 coordinates
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

  calculateNDeliveryTime(roadPointsArray, n) {
    let completeRoadPointsArray = [];
    roadPointsArray.forEach((roadPoints) => {
      completeRoadPointsArray = [...completeRoadPointsArray, ...roadPoints];
    });

    console.log(completeRoadPointsArray);

    completeRoadPointsArray.sort((a, b) => {
      if (a.duration < b.duration) return -1;
      if (a.duration > b.duration) return 1;
      return 0;
    });

    console.log(completeRoadPointsArray, roadPointsArray);
    return completeRoadPointsArray[n - 1];
  }
}
