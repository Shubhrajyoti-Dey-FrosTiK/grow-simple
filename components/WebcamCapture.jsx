import React from "react";
import Webcam from "react-webcam";

const FACING_MODE_USER = { exact: "user" };
const FACING_MODE_ENVIRONMENT = { exact: "environment" };

const videoConstraints = {
  facingMode: FACING_MODE_USER,
};

const WebcamCapture = () => {
  // const [deviceId, setDeviceId] = React.useState({});
  // const [devices, setDevices] = React.useState([]);

  // const handleDevices = React.useCallback(
  //   (mediaDevices) =>
  //     setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
  //   [setDevices]
  // );

  // React.useEffect(() => {
  //   navigator.mediaDevices.enumerateDevices().then(handleDevices);
  // }, [handleDevices]);

  // return (
  //   <>
  //     {devices.map((device, key) => (
  //       <div key={device.label}>
  //         <Webcam
  //           audio={false}
  //           videoConstraints={{ deviceId: device.deviceId }}
  //         />
  //         {device.label || `Device ${key + 1}`}
  //       </div>
  //     ))}
  //   </>
  // );

  // const videoConstraints = {
  //   facingMode: { exact: "environment" },
  // };

  // return (
  //   <div>
  //     Video Camera
  //     <Webcam videoConstraints={videoConstraints} />
  //   </div>
  // );

  const [facingMode, setFacingMode] = React.useState(FACING_MODE_USER);

  const handleClick = React.useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  return (
    <>
      <button onClick={handleClick}>Switch camera</button>
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          ...videoConstraints,
          facingMode,
        }}
      />
    </>
  );
};

export default WebcamCapture;
