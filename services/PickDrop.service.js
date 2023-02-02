import axios from "axios";
import { LIMIT } from "../constants/limit";

export class PickDropService {
  // FOR SPLITTING ARRAY INTO N PIECES (Rate limiter)
  splitToChunks(array, pieceLen) {
    let result = [];
    while (array.length) {
      result.push(array.splice(0, Math.min(array.length, pieceLen)));
    }
    return result;
  }

  // Combine the starting points with the ending
  combine(pickPoints, dropPoints) {
    let pickDropData = [];

    // Pick Map
    const productPickMap = {};
    pickPoints.forEach((pick) => {
      if (!productPickMap[pick.product_id])
        productPickMap[pick.product_id] = [];
      productPickMap[pick.product_id].push(pick);
    });

    // Drop Map
    const productDropMap = {};
    dropPoints.forEach((drop) => {
      if (!productDropMap[drop.product_id])
        productDropMap[drop.product_id] = [];
      productDropMap[drop.product_id].push(drop);
    });

    for (let productId in productPickMap) {
      const tempData = [];

      productPickMap[productId].forEach((pick) => {
        if (productDropMap[productId])
          productDropMap[productId].forEach((drop) => {
            tempData.push({
              ...pick,
              drop,
            });
          });
        else
          tempData.push({
            ...pick,
            drop: null,
          });
      });

      pickDropData = [...pickDropData, ...tempData];
    }
    return pickDropData;
  }

  // GET GEO Coordinates
  async getGeoCoordinates(batchItems, originGeoInfo, destGeoInfo, origin) {
    // GET THE GEO COORDINATES OF THE POINTS
    const geoEncodeUrl =
      process.env.NEXT_PUBLIC_AZURE_MAPS_BATCH_GEOENCODING_API || "";

    const geoCoordinates = await axios.post(geoEncodeUrl, {
      batchItems,
    });

    if (geoCoordinates.data.batchItems) {
      geoCoordinates.data.batchItems.forEach((data) => {
        const coordinates = data.features[0].geometry.coordinates;
        if (originGeoInfo.length < origin.length) {
          originGeoInfo.push({
            longitude: coordinates[0],
            latitude: coordinates[1],
          });
        } else {
          destGeoInfo.push({
            longitude: coordinates[0],
            latitude: coordinates[1],
          });
        }
      });
    }
  }

  // Batch Process Geo Coordinates
  async batchGeoCoordinates(origin, dest) {
    const processedData = [];

    // CONVERTING THE DATA INTO THE API COMPATIBLE FORM
    [...origin, ...dest].forEach((sample) =>
      processedData.push({ addressLine: sample.location })
    );

    const batchedProcessedData = this.splitToChunks(
      processedData,
      LIMIT.GEO_ENCODING
    );

    const originGeoInfo = [];
    const destGeoInfo = [];

    // Promise.all(batchedProcessedData.forEach(async (batchItems) => {}));
    await Promise.all(
      batchedProcessedData.map((batchItems) =>
        this.getGeoCoordinates(batchItems, originGeoInfo, destGeoInfo, origin)
      )
    );

    return {
      originGeoInfo,
      destGeoInfo,
    };
  }

  // GET Distance Matrix
  async distanceMatrix(originGeoInfo, destGeoInfo, distanceMatrix, len) {
    const distanceMatrixProp = {
      origins: originGeoInfo,
      destinations: destGeoInfo,
      travelMode: "driving",
    };

    const distanceMatrixResponse = await axios.post(
      process.env.NEXT_PUBLIC_BING_MAPS_DISTANCE_MATRIX_API || "",
      distanceMatrixProp
    );

    // Populate the rows
    distanceMatrixResponse.data.resourceSets[0].resources[0].results.forEach(
      (dm) => {
        distanceMatrix[dm.destinationIndex + len][dm.originIndex] =
          dm.travelDistance;
      }
    );
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

    // Create the rows
    for (let i = 0; i < destGeoInfo.length; i++) {
      const tempDmCols = [];
      for (let j = 0; j < originGeoInfo.length; j++) {
        tempDmCols.push(null);
      }
      distanceMatrix.push(tempDmCols);
    }

    // Populate all the rows
    await Promise.all(
      destBatch.map((dest, index) =>
        this.distanceMatrix(
          originGeoInfo,
          dest,
          distanceMatrix,
          index * LIMIT.DISTANCE_MATRIX
        )
      )
    );

    return distanceMatrix;
  }
}