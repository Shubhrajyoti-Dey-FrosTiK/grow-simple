import React, { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import Image from "next/image";

const FACING_MODE_USER = { exact: "user" };
const FACING_MODE_ENVIRONMENT = { exact: "environment" };

const videoConstraints = {
  facingMode: FACING_MODE_USER,
};

const WebcamCapture = () => {
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);

  const handleClick = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  const [img, setImg] = useState(null);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImg(imageSrc);
  }, [webcamRef]);

  return (
    <div className="container">
      <br />
      <button onClick={handleClick}>Switch camera</button>
      {img === null ? (
        <>
          <Webcam
            audio={false}
            imageSmoothing={true}
            mirrored={true}
            height={400}
            width={400}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              ...videoConstraints,
              facingMode,
            }}
          />
          <button onClick={capture}>Capture photo</button>
        </>
      ) : (
        <>
          <Image src={img} alt="screenshot" />
          <button onClick={() => setImg(null)}>Retake</button>
        </>
      )}
    </div>
  );
};

export default WebcamCapture;
