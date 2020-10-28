import {Priority} from "./Priority";
import {IPriority} from "./_types/IPriority";

/**
 * Tests whether priority a is higher than or equal to priority b
 * @param a Priority a
 * @param b Priority b
 * @returns Whether priority a is higher than b
 */
export function hasHigherOrEqualPriority(a: IPriority, b: IPriority): boolean {
    if (typeof a == "number") {
        if (typeof b == "number") return a >= b; // a shortcut for simple number priorities
        a = [a];
    }
    if (typeof b == "number") b = [b];
    let i = 0;
    let m = Math.max(a.length, b.length) - 1;
    while (i < m && (a[i] ?? Priority.MEDIUM) == (b[i] ?? Priority.MEDIUM)) i++;
    return (a[i] ?? Priority.MEDIUM) >= (b[i] ?? Priority.MEDIUM);
}
