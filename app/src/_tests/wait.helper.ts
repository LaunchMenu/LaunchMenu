/**
 * Waits for the specified amount of time before resolving
 * @param time The time in ms to wait (defaults to 200)
 * @returns A promise resolving after the specified amount of time
 */
export const wait = <T = void>(time: number = 200, value?: T) =>
    new Promise<T>(res => setTimeout(() => res(value), time));
