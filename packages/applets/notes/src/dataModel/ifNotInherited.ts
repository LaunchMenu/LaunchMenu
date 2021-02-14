import {IInherit, inherit} from "./_types/IInherit";

/**
 * Retrieves the current data, or undefined if data should be inherited
 * @param data The data to combine
 * @returns The data if not inherit, or undefined otherwise
 */
export function ifNotInherited<T>(data: T | IInherit): Exclude<T, IInherit> | undefined {
    return data == inherit ? undefined : (data as Exclude<T, IInherit>);
}
