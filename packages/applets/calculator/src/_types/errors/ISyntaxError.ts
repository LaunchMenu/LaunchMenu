export type ISyntaxError = Error & {
    /** The index of the unexpected character */
    char: number;
};

/**
 * Checks whether a given error is a syntax error
 * @param error The error to be tested
 * @returns Whether it's a syntax error
 */
export function isSyntaxError(error: any): error is ISyntaxError {
    return "char" in error;
}
