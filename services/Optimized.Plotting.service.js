// Map
import mapboxgl from "!mapbox-gl";
import { getDistance, getPreciseDistance } from "geolib";

export default class OptimizedPlottingService {
  // FOR SPLITTING ARRAY INTO N PIECES (Rate limiter)
  splitToChunks(array, pieceLen) {
    let result = [];
    while (array.length) {
      result.push(array.splice(0, Math.min(array.length, pieceLen)));
    }
    return result;
  }

  async getRoute(riderPath, route, roadSteps, routeNo) {
    let pointsArray = [];

    if (riderPath.length < 2) {
      if (!riderPath.length) return;
      route = [riderPath[0].longitude, riderPath[0].latitude];
      roadSteps[routeNo] = [[riderPath[0]]];
      return;
    }

    // Joining the latitude and longitude
    riderPath.forEach((point) =>
      pointsArray.push(`${point.longitude},${point.latitude}`)
    );

    const URL = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${pointsArray.join(
      ";"
    )}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${
      mapboxgl.accessToken
    }`;

    const query = await fetch(URL, { method: "GET" });
    const json = await query.json();

    // Capture the path which is the most recommended
    const data = json.routes[0];

    // This duration will include all the legs
    let duration = 0;
    let tempRoadSteps = [];

    data.legs.forEach((leg) => {
      const legCoordinates = [];
      let legDuration = 0;

      leg.steps.forEach((step) => {
        let stepDistance = 0;

        // Iterating over the coordinates of the step
        step.geometry.coordinates.forEach((coordinate, coordinateIndex) => {
          if (coordinateIndex) {
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
          }

          route.push(coordinate);
          const len = legCoordinates.length;
          legCoordinates.push({
            longitude: coordinate[0],
            latitude: coordinate[1],
            duration:
              legDuration +
              (stepDistance / (step.distance + 1)) * step.duration,
          });
        });

        legDuration += step.duration;
      });

      tempRoadSteps.push(legCoordinates);
    });
    roadSteps[routeNo] = tempRoadSteps;
  }

  // Plot the routes
  async route(map, path, roadSteps, routeNo) {
    const batchRiderPath = this.splitToChunks([...path], 24);
    const route = [];

    await Promise.all(
      batchRiderPath.map(
        async (path) => await this.getRoute(path, route, roadSteps, routeNo)
      )
    );

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };

    if (map.current.getSource(`route-${routeNo}`)) {
      map.current.getSource(`route-${routeNo}`).setData(geojson);
    } else {
      map.current.addLayer({
        id: `route-${routeNo}`,
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.6,
        },
      });
    }
  }
}
