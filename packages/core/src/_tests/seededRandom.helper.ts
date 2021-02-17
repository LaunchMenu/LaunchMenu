/**
 * Creates a seeded random function, based using mulberry32: https://stackoverflow.com/a/47593316/8521718
 * @param seed The seed for the random number generator
 * @returns The random number generator
 */
export function getSeededRandom(seed: number): () => number {
    return () => {
        var t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
