import React from "react";
import Webcam from "react-webcam";

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
  const videoConstraints = {
    facingMode: { exact: "environment" },
  };

  return (
    <div>
      Video Camera
      <Webcam videoConstraints={videoConstraints} />
    </div>
  );
};

export default WebcamCapture;
