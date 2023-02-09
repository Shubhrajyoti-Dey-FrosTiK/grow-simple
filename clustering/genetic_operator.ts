// @ts-nocheck

export function stochastic_universal_selection(
  fitness_values: number[],
  num_parents: number
) {
  let sum_of_fitness = fitness_values.reduce((prev, val) => prev + val);

  let fitness_scale: number[] = [];
  let back = 0.0;
  fitness_values.forEach((val, idx) => {
    if (idx == 0) {
      back = val;
      fitness_scale.push(back);
    } else {
      back += val;
      fitness_scale.push(back);
    }
  });

  let fitness_step = sum_of_fitness / num_parents;
  let random_initial = Math.random() * fitness_step;

  let current_offset = 0;
  let selected_indices: number[] = [];

  for (let i = 0; i <= num_parents; i++) {
    while (fitness_scale[current_offset] < i * fitness_step + random_initial) {
      current_offset += 1;
    }

    selected_indices.push(current_offset);
  }

  return selected_indices;
}

export function randomSelection(populationSize, numParents) {
  let population = Array.from({ length: populationSize }, (_, i) => i);
  return population
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(numParents, populationSize));
}

export function sigmaScaling(fitnessValues, scalingFactor) {
  let averageFitness =
    fitnessValues.reduce((a, b) => a + b, 0) / fitnessValues.length;
  let standardDeviation = Math.sqrt(
    fitnessValues
      .map((x) => Math.pow(x - averageFitness, 2))
      .reduce((a, b) => a + b, 0) / fitnessValues.length
  );
  let worstFitness = averageFitness - standardDeviation * scalingFactor;
  fitnessValues.forEach((x, i) => {
    if (x <= worstFitness) {
      fitnessValues[i] = 0;
    } else {
      fitnessValues[i] = x - worstFitness;
    }
    fitnessValues[i] = fitnessValues[i] + 1;
  });
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function scramble_mutation(individual: number[]) {
  let length_of_individual = individual.length;

  let idx1 = Math.floor(Math.random() * length_of_individual);
  let idx2 = Math.floor(Math.random() * length_of_individual);
  if (idx2 < idx1) {
    [idx1, idx2] = [idx2, idx1];
  }

  let slice = individual.slice(idx1, idx2 + 1);
  shuffleArray(slice);
  // console.log("hello", slice, idx1, idx2);
  let j = 0;
  for (let i = idx1; i <= idx2; i += 1) {
    individual[i] = slice[j];
    j++;
  }
  // console.log("hello", individual, slice, idx1, idx2);
}

export function orderCrossover(parent1: number[], parent2: number[]) {
  const n = parent1.length;

  const selected = Array.from({ length: 2 }, () =>
    Math.floor(Math.random() * n)
  );
  selected.sort((a, b) => a - b);

  const child1 = parent1.slice();
  const child2 = parent2.slice();

  const set1 = new Set();
  const set2 = new Set();

  for (let i = selected[0]; i <= selected[1]; i++) {
    set1.add(child1[i]);
    set2.add(child2[i]);
  }

  let currentIdx = 0;
  for (let i = 0; i < n; i++) {
    if (i >= selected[0] && i <= selected[1]) continue;

    while (currentIdx < n && set1.has(parent2[currentIdx])) {
      currentIdx++;
    }
    if (currentIdx < n) {
      set1.add(parent2[currentIdx]);
      child1[i] = parent2[currentIdx];
    }
  }

  currentIdx = 0;
  for (let i = 0; i < n; i++) {
    if (i >= selected[0] && i <= selected[1]) continue;
    while (currentIdx < n && set2.has(parent1[currentIdx])) {
      currentIdx++;
    }
    if (currentIdx < n) {
      set2.add(parent1[currentIdx]);
      child2[i] = parent1[currentIdx];
    }
  }

  return [child1, child2];
}
