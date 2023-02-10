import {
  orderCrossover,
  randomSelection,
  scramble_mutation,
  shuffleArray,
  sigmaScaling,
  stochastic_universal_selection,
} from "./genetic_operator";
import { Route } from "./model";

function get_distance(
  path: number[],
  distance_matrix: number[][],
  rider_index: number,
  rider_matrix: number[][]
) {
  const end = path[path.length - 1];
  // console.log(end, path);
  let distance =
    rider_matrix[rider_index][path[0] - 1] + distance_matrix[end][0];
  if (!distance)
    console.log(
      distance,
      rider_index,
      path[0],
      rider_matrix[rider_index][path[0]],
      distance_matrix[end][0]
    );

  for (let index = 0; index < path.length - 1; index++) {
    const idx1 = path[index];
    const idx2 = path[index + 1];
    distance += distance_matrix[idx1][idx2];
  }
  if (!distance) {
    // console.log(distance, distance_matrix, path);
  }

  return distance;
}

function get_time(path: number[], time_matrix: number[][]) {
  const end = path[path.length - 1];
  let time = time_matrix[end][0];
  for (let index = 0; index < path.length - 1; index++) {
    const idx1 = path[index];
    const idx2 = path[index + 1];
    time += time_matrix[idx1][idx2];
  }
  return time;
}

function num_del_fit(num_delivery: number) {
  const max_size = 30;
  if (num_delivery < max_size - 5) {
    return 1;
  }
  return (1 / num_delivery) * 10;
}

function fitness_function(
  path: number[],
  rider_index: number,
  distance_matrix: number[][],
  time_matrix: number[][],
  rider_matrix: number[][]
) {
  const d = get_distance(path, distance_matrix, rider_index, rider_matrix);
  const t = get_time(path, time_matrix);
  const delivery_size_fitness = num_del_fit(path.length);
  // console.log("path_length", path.length);
  return Math.exp(-d / 100) * (1 / (1 + t)) * Math.exp(path.length);
}

function get_fitness_values(
  population: number[][],
  rider_index: number,
  distance_matrix: number[][],
  time_matrix: number[][],
  rider_matrix: number[][]
): number[] {
  let fit_vals: number[] = [];
  population.forEach((a) =>
    fit_vals.push(
      fitness_function(
        a,
        rider_index,
        distance_matrix,
        time_matrix,
        rider_matrix
      )
    )
  );
  return fit_vals;
}

export function genetic_algorithm(
  distance_matrix: number[][],
  time_matrix: number[][],
  rider_matrix: number[][],
  rider_index: number,
  route: Route
): [number, number[]] {
  console.log("genetic algo");
  const population_size = 200;
  const iterations = 500;
  const mutation_probability = 0.1;

  let population: number[][] = new Array();
  for (let i = 0; i < population_size; i++) {
    let path: number[] = [];
    route.nodes.forEach((node) => path.push(node.index));
    shuffleArray(path);
    population.push(path);
  }

  let best_now = [...population[0]];
  if (route.nodes.length == 1) {
    return [
      get_distance(best_now, distance_matrix, rider_index, rider_matrix),
      best_now,
    ];
  }

  for (let iteration = 0; iteration < iterations; iteration++) {
    const idxs = randomSelection(population_size, 2);
    let [child1, child2] = orderCrossover(
      population[idxs[0]],
      population[idxs[1]]
    );

    if (Math.random() < mutation_probability) {
      scramble_mutation(child1);
    }
    if (Math.random() < mutation_probability) {
      scramble_mutation(child2);
    }

    population.push(child1);
    population.push(child2);
    // console.log(child1, child2)
    let fitness_values = get_fitness_values(
      population,
      rider_index,
      distance_matrix,
      time_matrix,
      rider_matrix
    );

    sigmaScaling(fitness_values, 1.2);
    let selected_idx = stochastic_universal_selection(
      fitness_values,
      population_size
    );
    let p: number[][] = [];

    let best = population[0];
    for (let index = 0; index < population.length; index++) {
      if (
        fitness_function(
          population[index],
          rider_index,
          distance_matrix,
          time_matrix,
          rider_matrix
        ) >
        fitness_function(
          best,
          rider_index,
          distance_matrix,
          time_matrix,
          rider_matrix
        )
      ) {
        best = population[index];
      }
    }

    if (
      fitness_function(
        best,
        rider_index,
        distance_matrix,
        time_matrix,
        rider_matrix
      ) >
      fitness_function(
        best_now,
        rider_index,
        distance_matrix,
        time_matrix,
        rider_matrix
      )
    ) {
      best_now = best;
    }
  }

  return [
    get_distance(best_now, distance_matrix, rider_index, rider_matrix),
    best_now,
  ];
}
