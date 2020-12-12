import {IPriority} from "./_types/IPriority";

export enum Priority {
    EXTRAHIGH = 500,
    HIGH = 400,
    MEDIUM = 300,
    LOW = 200,
    EXTRALOW = 100,
    NONE = 0,
}
export namespace Priority {
    /**
     * Checks whether a given priority is non zero
     * @param priority The priority to be checked
     * @returns Whether this priority is not zero
     */
    export function isNonZero(priority: IPriority): boolean {
        return priority instanceof Array ? priority[0] != 0 : priority != 0;
    }

    /**
     * Checks whether a given priority is positive
     * @param priority The priority to be checked
     * @returns Whether this priority is positive
     */
    export function isPositive(priority: IPriority): boolean {
        return priority instanceof Array ? priority[0] > 0 : priority > 0;
    }
}
