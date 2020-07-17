/**
 * If popping failed, throws the given error
 * @param popped Whether popping was successful
 * @param stackName The name of the stack that couldn't be popped from
 * @throws An exception if popping failed
 */
export function withPopError(popped: boolean, stackName: string): void {
    if (!popped)
        throw Error(
            `Failed to pop from the ${stackName} stack, make sure all other items on top are popped first.`
        );
}
