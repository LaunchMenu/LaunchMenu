export type IJSON =
    | string
    | number
    | boolean
    | null
    | undefined
    | IJSON[]
    | {[key: string]: IJSON};
