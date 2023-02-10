import { genetic_algorithm, get_distance } from "./genetic_algorithm";
import { Node, Route } from "./model";

if (!global.structuredClone) {
  global.structuredClone = function structuredClone(objectToClone: any) {
    const stringified = JSON.stringify(objectToClone);
    const parsed = JSON.parse(stringified);
    return parsed;
  };
}

export function getCost(nodes: number[], distance: number) {
  const max_del = 30;
  // return distance;
  if (nodes.length <= max_del - 5) return distance;
  if (nodes.length <= max_del)
    return distance + (nodes.length - max_del + 5) ** 2;
  return Number.MAX_SAFE_INTEGER;
}

export function clustering(
  node: Node,
  routes: Route[],
  distanceMatrix: number[][],
  timeMatrix: number[][],
  riderMatrix: number[][]
): void {
  let minIncrease = Number.MAX_VALUE;
  let minRiderIndex = 0;
  let optimalRider = [...routes][0];

  for (let riderIndex = 0; riderIndex < routes.length; riderIndex++) {
    let route = routes[riderIndex];
    let tempRoute: Route = structuredClone(route);

    if (!tempRoute.nodes) tempRoute.nodes = [];
    tempRoute.nodes.push(node);

    let result = genetic_algorithm(
      distanceMatrix,
      timeMatrix,
      riderMatrix,
      riderIndex,
      tempRoute
    );

    let [cost, newRoute] = result;
    cost = getCost(newRoute, cost);

    let nodes = newRoute.map((idx) => {
      return tempRoute.nodes.find((node) => node.index === idx) as Node;
    });
    tempRoute.nodes = nodes;

    // let previousDistance = calc_distance(route, distanceMatrix);
    let previousDistance = 1;

    if (route.nodes.length) {
      let index_array: number[] = [];
      for (let i = 0; i < route.nodes.length; i++) {
        index_array.push(route.nodes[i].index);
      }
      // console.log(index_array[0]-1, riderIndex);

      previousDistance = get_distance(
        index_array,
        distanceMatrix,
        riderIndex,
        riderMatrix
      );

      previousDistance = getCost(index_array, previousDistance);
    }

    let increasedCost = cost - previousDistance;
    // console.log(node, riderIndex, cost, previousDistance, cost-previousDistance);
    if (increasedCost < minIncrease) {
      minIncrease = increasedCost;
      minRiderIndex = riderIndex;
      optimalRider = tempRoute;
    }
  }

  routes[minRiderIndex] = optimalRider;
}
