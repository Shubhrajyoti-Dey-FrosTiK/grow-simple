/* tslint:disable */
/* eslint-disable */
/**
* @param {number} x
* @param {number} y
* @returns {number}
*/
export function add(x: number, y: number): number;
/**
* @param {number} iterations
* @param {any} routes
* @param {any} distance_matrix
* @param {any} time_matrix
* @param {any} rider_matrix
* @param {number} nodes_mut
* @returns {any}
*/
export function invoke_mutation_from_js(iterations: number, routes: any, distance_matrix: any, time_matrix: any, rider_matrix: any, nodes_mut: number): any;
/**
* @param {any} routes
* @param {any} node
* @param {any} distance_matrix
* @param {any} time_matrix
* @param {any} rider_matrix
* @returns {any}
*/
export function invoke_clustering_from_js(routes: any, node: any, distance_matrix: any, time_matrix: any, rider_matrix: any): any;
/**
*/
export enum DeliveryType {
  Pickup = 0,
  Delivery = 1,
}
/**
*/
export class Node {
  free(): void;
/**
*/
  delivery_type: number;
/**
*/
  index: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly add: (a: number, b: number) => number;
  readonly __wbg_node_free: (a: number) => void;
  readonly __wbg_get_node_delivery_type: (a: number) => number;
  readonly __wbg_set_node_delivery_type: (a: number, b: number) => void;
  readonly __wbg_get_node_index: (a: number) => number;
  readonly __wbg_set_node_index: (a: number, b: number) => void;
  readonly invoke_mutation_from_js: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly invoke_clustering_from_js: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
