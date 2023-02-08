export type Node = {
    delivery_type:DeliveryType,
    index: number
}

export enum DeliveryType {
    pickup = 1,
    delivery = 2
}

export type Route  = {
    nodes: Node[],
}