import React, { useRef } from "react";
import GoogleMapReact from "google-map-react";

// npm install --save google-map-react
// https://codesandbox.io/s/affectionate-field-lhowx?file=/src/App.js:460-570

const WAYPOINTS = [
  [38.937165, -77.04559],
  [38.9, -77.0],
  [38.881152, -76.990693],
];

async function getRouteData() {
  let waypointArray = [];
  WAYPOINTS.forEach((waypoint) => waypointArray.push(waypoint.join(",")));
  let waypointString = waypointArray.join("|");

  let URL = `https://api.geoapify.com/v1/routing?waypoints=${waypointString}&mode=drive&apiKey=${process.env.GEOAPIFY_KEY}`;
  const res = await fetch(URL);

  if (!res.ok) {
    throw new Error("Failed to fetch map data.");
  }

  return res.json();
}

const AnyReactComponent = ({ text }) => <div>{text}</div>;

export default function GoogleMap() {
  const mapRef = useRef();

  const defaultProps = {
    center: {
      lat: WAYPOINTS[0][0],
      lng: WAYPOINTS[0][1],
    },
    zoom: 11,
  };

  const handleApiLoaded = async (map, maps, isOn) => {
    const routeData = await getRouteData();
    mapRef.current = map;
    mapRef.current.data.loadGeoJson(routeData);
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.GOOGLE_MAPS_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps, isOn)}
      >
        <AnyReactComponent
          lat={WAYPOINTS[0][0]}
          lng={WAYPOINTS[0][1]}
          text="My Marker"
        />
      </GoogleMapReact>
    </div>
  );
}
