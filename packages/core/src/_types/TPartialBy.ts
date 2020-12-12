/** Makes the given keys partial */
export type TPartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
