/**
 * If removing failed, throws the given error
 * @param removed Whether removing was successful
 * @param stackName The name of the stack that couldn't be removed from
 * @throws An exception if removing failed
 */
export function withRemoveError(removed: boolean, stackName: string): void {
    if (!removed)
        throw Error(
            `Failed to remove item from the ${stackName} stack, make sure to not remove it in another way.`
        );
}
