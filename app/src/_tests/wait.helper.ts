/**
 * Waits for the specified amount of time before resolving
 * @param time The time in ms to wait (defaults to 200)
 * @returns A promise resolving after the specified amount of time
 */
export const wait = (time: number = 200) => new Promise(res => setTimeout(res, time));
