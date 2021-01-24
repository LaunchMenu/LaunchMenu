export type IJSON =
    | string
    | number
    | boolean
    | null
    | undefined // Not technically json, but acts the same as absence of key
    | IJSON[]
    | {[key: string]: IJSON};
