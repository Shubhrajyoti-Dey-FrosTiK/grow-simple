import { Drop, Pick } from "../store/states/pickDrop";

export interface PickDrop extends Pick {
  drop: Drop | null;
}

export interface ProductPick {
  [key: string]: Array<Pick>;
}

export interface ProductDrop {
  [key: string]: Array<Drop>;
}

export class PickDropService {
  combine(pickPoints: Array<Pick>, dropPoints: Array<Drop>): Array<PickDrop> {
    let pickDropData: Array<PickDrop> = [];

    // Pick Map
    const productPickMap: ProductPick = {};
    pickPoints.forEach((pick: Pick) => {
      if (!productPickMap[pick.product_id])
        productPickMap[pick.product_id] = [];
      productPickMap[pick.product_id].push(pick);
    });

    // Drop Map
    const productDropMap: ProductDrop = {};
    dropPoints.forEach((drop: Drop) => {
      if (!productDropMap[drop.product_id])
        productDropMap[drop.product_id] = [];
      productDropMap[drop.product_id].push(drop);
    });

    for (let productId in productPickMap) {
      const tempData: Array<PickDrop> = [];

      productPickMap[productId].forEach((pick: Pick) => {
        if (productDropMap[productId])
          productDropMap[productId].forEach((drop: Drop) => {
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
}
