/**
 * An identifier object for keyboard keys
 */
export type IKey = {
    /** The numeric ID of a key */
    readonly id: number;
    /** The name of a key */
    readonly name: string;
    /** The character of a key if any*/
    readonly char?: string;
};
