import {IJSON} from "../../../../../_types/IJSON";

/**
 * A type that can be used to decode from JSON data
 */
export type IJSONDeserializer<
    I extends IJSON = IJSON,
    O = any,
    N extends string = string
> = {
    /** The name of the data type, should be unique */
    readonly jsonTypeName: N;

    /**
     * Decodes the given data from json
     * @param data The json data to decode
     * @throws An exception of the data doesn't fit the format
     * @returns The decoded data
     */
    deserialize(data: I): O;
};
