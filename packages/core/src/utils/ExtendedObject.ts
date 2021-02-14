import {TDeepMerge} from "./_types/TDeepMerge";

/**
 * Some object related utils
 */
export class ExtendedObject {
    // Testing methods
    /**
     * Checks whether a passed object is a plain javascript object
     * @param obj The object to perform the operation on
     * @returns Whether or not the object is a plain javascipt object
     */
    public static isPlainObject(obj: any): obj is {[key: string]: any} {
        // @ts-ignore
        return obj && obj.__proto__ && obj.__proto__.constructor == Object;
    }

    // Mapping methods
    /**
     * Maps the values of an object to a new object
     * @param obj The object to perform the operation on
     * @param func The function to use for the mapping, where the params are value, key, and the return value is used as the new value
     * @returns The object created as a mapping of the values of this object
     */
    public static mapValues<O extends {[key: string]: any}, T>(
        obj: O,
        func: (value: O[keyof O], key: string) => T
    ): {[P in keyof O]: T} {
        // Get the keys of the this object
        const keys = Object.keys(obj);

        // Create an output object
        const out = {} as {[key: string]: any};

        // Go through all keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // Call the passed func to map the value
            const newValue = func(obj[key], key);

            // Store the mapped value
            out[key] = newValue;
        }

        // Return the output object
        return out as any;
    }

    /**
     * Maps the values of an object to a new object, alias for mapValues
     * @param obj The object to perform the operation on
     * @param func The function to use for the mapping, where the params are value, key, and the return value is used as the new value
     * @returns The object created as a mapping of the values of this object
     */
    public static map<O, T>(
        obj: O,
        func: (value: O[keyof O], key: string) => T
    ): {[P in keyof O]: T} {
        return this.mapValues(obj, func);
    }

    /**
     * Maps the keys of an object to a new object
     * @param obj The object to perform the operation on
     * @param func The function to use for the mapping, where the params are key, value, and the return value is used as the new key
     * @returns The object created as a mapping of the keys of this object
     */
    public static mapKeys<S>(
        obj: {[name: string]: S},
        func: (key: string, value: S) => string
    ): {[name: string]: S} {
        // Get the keys of the this object
        const keys = Object.keys(obj);

        // Create an output object
        const out = {} as {[key: string]: any};

        // Go through all keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // Call the passed func to map the key
            const newKey = func(key, obj[key]);

            // Store the mapped key
            out[newKey] = obj[key];
        }

        // Return the output object
        return out;
    }

    /**
     * Maps the keys and values of an object to a new object
     * @param obj The object to perform the operation on
     * @param func The function to use for the mapping, where the params are key, value, and the return value is an array with the key as the first index, and value as the second
     * @returns The object created as a mapping of the keys and values of this object
     */
    public static mapPairs<S, T>(
        obj: {[name: string]: S},
        func: (key: string, value: S) => [string, T]
    ): {[name: string]: T} {
        // Get the keys of the this object
        const keys = Object.keys(obj);

        // Create an output object
        const out = {} as {[key: string]: any};

        // Go through all keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // Call the passed func to map the key and value
            const [newKey, newValue] = func(key, obj[key]);

            // Store the mapped key
            out[newKey] = newValue;
        }

        // Return the output object
        return out;
    }

    /**
     * Creates an object from the given entry array
     * @param entries The entries to create an object from
     * @returns The resulting object
     */
    public static fromEntries<S>(entries: [string, S][]): {[key: string]: S} {
        const out = {} as {[key: string]: any};
        entries.forEach(([key, value]) => {
            out[key] = value;
        });
        return out;
    }

    /**
     * Filters the some fields from the object
     * @param obj The object to perform the operation on
     * @param func The function to use to filter, where the params are value and key
     * @returns The object created which contains all fields that the func returned true for
     */
    public static filter<S extends {[key: string]: any}>(
        obj: S,
        func: (value: S[keyof S], key: string) => boolean
    ): Partial<S> {
        // Get the keys of the this object
        const keys = Object.keys(obj);

        // Create an output object
        const out = {} as any;

        // Go through all keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // Check if the field should be included
            if (func(obj[key], key)) {
                // Store the field in the output
                out[key] = obj[key];
            }
        }

        // Return the output object
        return out;
    }

    /**
     * Creates an object containing of the defined fields
     * @param obj The object to perform the operation on
     * @param fields A list of fields to include in the object
     * @returns The object created which contains all specified fields
     */
    public static project(obj: {[key: string]: any}, fields: Array<string>): object {
        // Get the keys of the this object
        const keys = Object.keys(obj);

        // Create an output object
        const out = {} as any;

        // Go through all keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // Check if the field should be included
            if (fields.indexOf(key) !== -1) {
                // Store the field in the output
                out[key] = obj[key];
            }
        }

        // Return the output object
        return out;
    }

    // Itarator methods
    /**
     * Calls the provided method on all key value pairs
     * @param obj The object to perform the operation on
     * @param func The function to call for each of the pairs, receives key and value as parameters
     * @param recurse Whether or notto recurse on a child object, a function can be provided that will receive the key and value as parameters, and returns whether or not to recurse
     * @param includeRecurseObj Whether the object that is recursed on should also be called on the function
     * @param path The path to include to the callback of where we are at in the object
     */
    public static forEach<S>(
        obj: {[name: string]: S},
        func: (key: string, value: S, path: string, parentPath: string) => void,
        recurse:
            | ((key: string, value: S, path: string, parentPath: string) => boolean)
            | boolean = false,
        includeRecurseObj: boolean = false,
        path: string = ""
    ): void {
        // Get the keys of the this object
        const keys = Object.keys(obj);

        // Go through all keys
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = obj[key];
            const p = (path ? path + "." : "") + key;

            // Check if we should recurse
            if (
                typeof recurse == "function"
                    ? value instanceof Object && recurse(key, value, p, path)
                    : recurse && this.isPlainObject(value)
            ) {
                // Call the function
                if (includeRecurseObj) func(key, value, p, path);

                // Recurse
                this.forEach(value as any, func, recurse, includeRecurseObj, p);
            } else {
                // Call the function
                func(key, value, p, path);
            }
        }
    }

    /**
     * Calls the provided method on all key value pairs that are available in each object
     * @param objects The array of objects to perform the operation on
     * @param func The function to call for each of the pairs, receives key and value as parameters
     * @param recurse Whether or notto recurse on a child object, a function can be provided that will receive the key and value as parameters, and returns whether or not to recurse
     * @param firstObjectLeading Whether the first object dictates the structure, I.e. if a subsequent object doesn't contain a substructure, it appears as if it does have the structured but is filled with undefined.
     * @param path The path to include to the callback of where we are at in the object
     */
    public static forEachPaired(
        objects: {[key: string]: any}[],
        func: (key: string, values: any[], path: string, parentPath: string) => void,
        recurse:
            | ((key: string, values: any[], path: string, parentPath: string) => boolean)
            | boolean = false,
        firstObjectLeading: boolean = false,
        path: string = ""
    ): void {
        // Get the keys of the this object
        const keys = Object.keys(objects[0]);

        // Go through all keys
        keyLoop: for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            // Check if the key is present in all objects
            if (!firstObjectLeading)
                for (let j = 1; j < objects.length; j++)
                    if (objects[j][key] === undefined) continue keyLoop;

            // Get the values for each of the objects
            const values = objects.map(obj => (obj ? obj[key] : undefined));
            const p = (path ? path + "." : "") + key;

            // Check if all values are of type object
            const isPlainObject = firstObjectLeading
                ? this.isPlainObject(values[0])
                : values.reduce(
                      (cur, value) =>
                          cur & ((this.isPlainObject(value) as any) as number),
                      true
                  );

            // Check if we should recurse
            if (
                isPlainObject &&
                recurse &&
                (typeof recurse != "function" || recurse(key, values, p, path))
            ) {
                this.forEachPaired(values, func, recurse, firstObjectLeading, p);
            } else {
                // Call the function
                func(key, values, p, path);
            }
        }
    }

    // Modification methods
    /**
     * Merges two objects together
     * @param obj1 The first object
     * @param obj2 The second object (which takes precedence)
     * @returns The merged objects
     */
    public static deepMerge<
        A extends {[key: string]: any},
        B extends {[key: string]: any}
    >(obj1: A, obj2: B): TDeepMerge<A, B> {
        if (obj1 instanceof Object && obj2 instanceof Object) {
            const obj = {} as any;
            Object.keys(obj1).forEach(key => {
                if (!obj2[key]) obj[key] = obj1[key];
            });
            Object.keys(obj2).forEach(key => {
                if (!obj1[key]) obj[key] = obj2[key];
            });
            Object.keys(obj1).forEach(key => {
                if (obj1[key] && obj2[key])
                    obj[key] = this.deepMerge(obj1[key], obj2[key]);
            });
            return obj;
        } else return obj2 as any;
    }

    // Comparison methods
    /**
     * Checks if the contents of object 1 and 2 are equal
     * @param obj1 The first object
     * @param obj2 The second object
     * @param includeObjects Whether object difference should be taken into account
     * @returns Whether or not the contents of the two objects are equivalent
     */
    public static equals(
        obj1: {[key: string]: any},
        obj2: {[key: string]: any},
        includeObjects: boolean = true
    ): boolean {
        // Check if there are the same number of values present
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);
        if (obj1Keys.length != obj2Keys.length) return false;

        // Check if all values are equivalent
        for (let i = 0; i < obj1Keys.length; i++) {
            const key = obj1Keys[i];

            // Values may only differ if they are objects
            if (
                (typeof obj1[key] != "object" || includeObjects) &&
                obj1[key] !== obj2[key]
            )
                return false;
        }

        return true;
    }

    /**
     * Checks if the contents of object 1 and 2 are equal, including subobjects
     * @param obj1 The first object
     * @param obj2 The second object
     * @param maxDepth The maximum depth to check
     * @returns Whether or not the contents of the two objects are equivalent
     */
    public static deepEquals(
        obj1: {[key: string]: any},
        obj2: {[key: string]: any},
        maxDepth: number = Infinity
    ): boolean {
        if (obj1 == obj2) return true;
        if (maxDepth == 0) return false;

        // Check if there are the same number of values present
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);
        if (obj1Keys.length != obj2Keys.length) return false;

        // Check if all values are equivalent
        for (let i = 0; i < obj1Keys.length; i++) {
            const key = obj1Keys[i];
            if (
                (this.isPlainObject(obj1[key]) || obj1[key] instanceof Array) &&
                (this.isPlainObject(obj2[key]) || obj2[key] instanceof Array)
            ) {
                // Recurse if object or array
                if (!this.deepEquals(obj1[key], obj2[key], maxDepth - 1)) return false;
            } else {
                // Check shallow equivalence otherwise
                if (obj1[key] !== obj2[key]) return false;
            }
        }

        return true;
    }
}
