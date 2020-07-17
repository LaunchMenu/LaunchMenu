/**
 * A recursive format for specifying the keys of an object
 */
export type IRecursiveKeys<D extends {}> =
    | {
          [K in keyof D]?: IRecursiveKeys<D[K]>;
      }
    | true;
