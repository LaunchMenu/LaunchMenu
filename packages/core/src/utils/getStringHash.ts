// Source: https://stackoverflow.com/a/7616484/8521718
/**
 * Retrieves the hash for a given string
 * @param string The string to get the hash for
 * @returns The hash number
 */
export function getStringHash(string: string): number {
    var hash = 0,
        i: number,
        chr: number;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
