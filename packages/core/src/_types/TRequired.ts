/**
 * Makes all fields required
 */
export type TRequired<T extends Object> = {[P in keyof T]-?: T[P]};
