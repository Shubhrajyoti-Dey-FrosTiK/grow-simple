export enum DeliveryType {
  Pickup,
  Delivery,
}

export interface Node {
  delivery_type: DeliveryType;
  index: number;
}

export interface Route {
  nodes: Node[];
}

export function calc_distance(
  route: Route,
  distance_matrix: number[][]
): number {
  const nodes = route.nodes;
  let sum = 0;
  for (let index = 0; index < nodes.length - 1; index++) {
    const val1 = nodes[index];
    const val2 = nodes[index + 1];
    sum += distance_matrix[val1.index][val2.index];
  }

  return sum;
}

export function calc_num_delivery(route: Route): number {
  const nodes = route.nodes;
  let count = 0;
  nodes.forEach((node) => {
    if (node.delivery_type == DeliveryType.Delivery) {
      count++;
    }
  });
  return count;
}

export function is_feasible(
  route: Route,
  item_size: any,
  bag_size: number
): boolean {
  let current_weight = 0;
  route.nodes.forEach((node) => {
    if (node.delivery_type == DeliveryType.Delivery) {
      current_weight += item_size[node.index];
    }
  });

  if (current_weight > bag_size) {
    return false;
  }

  for (let index = 0; index < route.nodes.length; index++) {
    const node_weight = item_size[route.nodes[index].index];
    if (route.nodes[index].delivery_type == DeliveryType.Delivery) {
      current_weight -= node_weight;
    } else {
      if (node_weight + current_weight > bag_size) {
        return false;
      }
      current_weight += node_weight;
    }
  }

  return true;
}
