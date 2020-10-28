type KeyValueObject<O> = {
    [P in keyof O]: [P, O[P]];
};

/**
 * Extracts a union of key value pairs from a given object
 */
export type TObjectToKeyValuePairs<O extends Object> = KeyValueObject<
    O
>[keyof KeyValueObject<O>];
