import {Route, Node} from  "./model";
import {radialSelection} from "./node_selection"
import { clustering } from "./clustering"

function routeMutate(
    routes: Route[],
    distanceMatrix: number[][],
    timeMatrix: number[][],
    riderMatrix: number[][],
    nodesMut: number
  ): void {
    const selectedNodes = radialSelection(routes, distanceMatrix, nodesMut).map(node => node);
    routes.forEach(route => {
      selectedNodes.forEach(node => {
        const idx = route.nodes.findIndex(nodeRem => nodeRem.index === node.index);
        if (idx !== -1) {
          route.nodes.splice(idx, 1);
        }
      });
    });
  
    selectedNodes.forEach(node => {
      clustering(node, routes, distanceMatrix, timeMatrix, riderMatrix);
    });
  }
  