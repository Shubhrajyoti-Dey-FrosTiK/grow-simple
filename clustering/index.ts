import { clustering } from "./clustering";
import { DeliveryType, Node } from "./model";

let routes = [
  {
    nodes: [],
  },
  {
    nodes: [],
  },
  {
    nodes: [],
  },
  {
    nodes: [],
  },
  {
    nodes: [],
  },
];

let node: Node = {
  delivery_type: DeliveryType.Delivery,
  index: 1,
};

let distance_matrix = [
  [0, 8.287, 8.287, 10.258, 8.128],
  [8.498, 0, 0, 2.238, 8.3],
  [8.498, 0, 0, 2.238, 8.3],
  [9.77, 2.691, 2.691, 0, 7.168],
  [7.863, 8.326, 8.326, 7.264, 0],
];

let time_matrix = [
  [0, 20.6833, 20.6833, 29, 22.0333],
  [26.3833, 0, 0, 8.9833, 21.7167],
  [26.3833, 0, 0, 8.9833, 21.7167],
  [31.0333, 10.6, 10.6, 0, 22.4167],
  [23.9333, 23.25, 23.25, 23.3667, 0],
];

let rider_matrix = [
  [0, 0, 0],
  [8.498, 8.498, 8.498],
  [8.498, 8.498, 8.498],
  [9.77, 9.77, 9.77],
  [7.863, 7.863, 7.863],
];

clustering(node, routes, distance_matrix, time_matrix, rider_matrix);

let node2: Node = {
  delivery_type: DeliveryType.Delivery,
  index: 2,
};

clustering(node2, routes, distance_matrix, time_matrix, rider_matrix);

let node3: Node = {
  delivery_type: DeliveryType.Delivery,
  index: 3,
};

clustering(node3, routes, distance_matrix, time_matrix, rider_matrix);
