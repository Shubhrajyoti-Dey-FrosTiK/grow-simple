import { genetic_algorithm } from "./genetic_algorithm";
import { calc_distance, Node, Route } from "./model";

export async function clustering(
  node: Node,
  routes: Route[],
  distanceMatrix: number[][],
  timeMatrix: number[][],
  riderMatrix: number[][]
): Promise<void> {
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

    let nodes = newRoute.map((idx) => {
      return tempRoute.nodes.find((node) => node.index === idx) as Node;
    });
    tempRoute.nodes = nodes;

    let previousDistance = 0;

    if (route.nodes.length) {
      previousDistance = calc_distance(route, distanceMatrix);
    }
    let increasedCost = cost - previousDistance;
    if (increasedCost < minIncrease) {
      minIncrease = increasedCost;
      minRiderIndex = riderIndex;
      optimalRider = tempRoute;
    }
  }

  routes[minRiderIndex] = optimalRider;
}
