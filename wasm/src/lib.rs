use wasm_bindgen::prelude::*;

pub mod genetic_operators;

pub mod genetic_algorithm;

pub mod model;

pub mod clustering;

pub mod node_selection;

pub mod route_mutation;

#[wasm_bindgen]
pub fn add(x:u32, y:u32)->u32{
    x+y
}