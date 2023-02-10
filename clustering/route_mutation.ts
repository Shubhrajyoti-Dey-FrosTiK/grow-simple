import { Route, Node } from "./model";
import { radialSelection } from "./node_selection";
import { clustering, getCost } from "./clustering";
import { get_distance } from "./genetic_algorithm";

function routeMutate(
  routes: Route[],
  distanceMatrix: number[][],
  timeMatrix: number[][],
  riderMatrix: number[][],
  nodesMut: number
): void {
  const selectedNodes = radialSelection(routes, distanceMatrix, nodesMut).map(
    (node) => node
  );
  routes.forEach((route) => {
    selectedNodes.forEach((node) => {
      const idx = route.nodes.findIndex(
        (nodeRem) => nodeRem.index === node.index
      );
      if (idx !== -1) {
        route.nodes.splice(idx, 1);
      }
    });
  });

  selectedNodes.forEach((node) => {
    clustering(node, routes, distanceMatrix, timeMatrix, riderMatrix);
  });
}

export function aux_route_mutation(
  routes: Route[],
  distanceMatrix: number[][],
  timeMatrix: number[][],
  riderMatrix: number[][],
  nodesMut: number,
  iterations: number
): Route[] {
  let mutation_routes = structuredClone(routes);
  for (let i = 0; i < iterations; i++) {
    routeMutate(
      mutation_routes,
      distanceMatrix,
      timeMatrix,
      riderMatrix,
      nodesMut
    );
    // console.table(mutation_routes);
  }

  // console.table(mutation_routes);
  let initial_cost = 0,
    mut_cost = 0;
  for (let i = 0; i < routes.length; i++) {
    let temp: number[] = [];
    let temp2: number[] = [];
    if (routes[i].nodes.length) {
      for (let j = 0; j < routes[i].nodes.length; j++) {
        temp.push(routes[i].nodes[j].index);
      }
      initial_cost += get_distance(temp, distanceMatrix, i, riderMatrix);
      initial_cost = getCost(temp, initial_cost);
    }
    if (mutation_routes[i].nodes.length) {
      for (let j = 0; j < mutation_routes[i].nodes.length; j++) {
        temp2.push(mutation_routes[i].nodes[j].index);
      }
      mut_cost += get_distance(temp2, distanceMatrix, i, riderMatrix);
      mut_cost = getCost(temp2, mut_cost);
    }
  }
  // console.table(mutation_routes);
  if (mut_cost > initial_cost) {
    return routes;
  }
  return mutation_routes;
}
