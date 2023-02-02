// Map
import mapboxgl from "!mapbox-gl";

export default class PlottingService {
  // FOR SPLITTING ARRAY INTO N PIECES (Rate limiter)
  splitToChunks(array, pieceLen) {
    let result = [];
    while (array.length) {
      result.push(array.splice(0, Math.min(array.length, pieceLen)));
    }
    return result;
  }

  // Plot the points on the map
  async points(map, riderPath, originLen) {
    riderPath.forEach((pathPoint, index) => {
      if (!index)
        new mapboxgl.Marker({
          color: "yellow",
        })
          .setLngLat([pathPoint.longitude, pathPoint.latitude])
          .addTo(map.current);
      else if (originLen >= index)
        new mapboxgl.Marker({
          color: "blue",
        })
          .setLngLat([pathPoint.longitude, pathPoint.latitude])
          .addTo(map.current);
      else
        new mapboxgl.Marker({
          color: "red",
        })
          .setLngLat([pathPoint.longitude, pathPoint.latitude])
          .addTo(map.current);

      //   map.current.on("load", () => {
      //     map.current.addLayer({
      //       id: `waypoint-${index + 1}`,
      //       type: "circle",
      //       source: {
      //         type: "geojson",
      //         data: {
      //           type: "FeatureCollection",
      //           features: [
      //             {
      //               type: "Feature",
      //               properties: {},
      //               geometry: {
      //                 type: "Point",
      //                 coordinates: [pathPoint.longitude, pathPoint.latitude],
      //               },
      //             },
      //           ],
      //         },
      //       },
      //       paint: {
      //         "circle-radius": 10,
      //         "circle-color": index < originLen ? "#3887be" : "red",
      //       },
      //     });
      //   });
    });

    // this.route(map, riderPath);
  }

  async location(map, latitude, longitude) {
    new mapboxgl.Marker(element)
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML(`<h1>Truck 1</h1>`)
      )
      .addTo(map.current);
  }

  async getRoute(riderPath, route, steps) {
    let pointsArray = [];

    // Joining the latitude and longitude
    riderPath.forEach((point) =>
      pointsArray.push(`${point.longitude},${point.latitude}`)
    );

    const URL = `https://api.mapbox.com/directions/v5/mapbox/driving/${pointsArray.join(
      ";"
    )}?alternatives=true&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${
      mapboxgl.accessToken
    }`;

    const query = await fetch(URL, { method: "GET" });
    const json = await query.json();
    const data = json.routes[0];

    data.geometry.coordinates.forEach((coordinate) => route.push(coordinate));
    data.legs[0].steps.forEach((step) => steps.push(step));
  }

  // Plot the routes
  async route(map, riderPath, routeNo) {
    const batchRiderPath = this.splitToChunks([...riderPath], 24);
    const route = [];
    const steps = [];

    await Promise.all(
      batchRiderPath.map((path) => this.getRoute(path, route, steps))
    );

    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };

    console.log(steps, route, riderPath, geojson);
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
          "line-width": 3,
          "line-opacity": 1,
        },
      });
    }

    return steps;
  }
}
