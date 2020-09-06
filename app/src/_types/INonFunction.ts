/**
 * A type that accepts anything but a function
 */
export type INonFunction =
    | boolean
    | string
    | number
    | null
    | undefined
    | object
    | void
    | Array<any>;
