// Source: https://stackoverflow.com/a/7616484/8521718
/**
 * Retrieves the hash for a given string
 * @param string The string to get the hash for
 * @param normalized Whether normalize the output number to the range [0, 1]
 * @returns The hash number
 */
export function getStringHash(string: string, normalized?: boolean): number {
    var hash = 0,
        i: number,
        chr: number;
    if (string.length === 0) return hash;
    for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }

    if(normalized) hash = (hash < 0 ?-1 : 1)*hash/Number.MAX_SAFE_INTEGER
    return hash;
}
