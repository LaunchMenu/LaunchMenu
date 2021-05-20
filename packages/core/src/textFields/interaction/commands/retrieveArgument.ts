import {IRetrievableArgument} from "./_types/IRetrievableArgument";

/**
 * Retrieves the argument for a command
 * @param arg The argument to retrieve
 * @returns The value of the argument
 */
export function retrieveArgument<T>(arg: IRetrievableArgument<T>): T {
    if (arg instanceof Function) return arg();
    return arg;
}
