/**
 * Makes all fields required
 */
export type TFull<T extends Object> = {[P in keyof T]-?: T[P]};
