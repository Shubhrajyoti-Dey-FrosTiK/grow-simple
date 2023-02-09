import { Node, Route } from "./model";

export function radialSelection(
    routes: Route[],
    distanceMatrix: number[][],
    k: number
): Node[] {
    const nodes: Node[] = [];
    routes.forEach((route) => nodes.push(...route.nodes))

    const selectedNode = nodes[Math.floor(Math.random() * nodes.length)];

    return nodes
        .filter(node => node.index !== selectedNode.index)
        .map(node => {return {val: distanceMatrix[node.index][selectedNode.index], node_val: node}})
        .sort((a, b) => a.val - b.val)
        .map(node => node.node_val)
        .slice(0, k);
}