import { IGeneratorCallback } from "./IGeneratorCallback";

export type IGenerator<I> = 
    /**
     * A generator function that can be used to generate items asynchronously
     * @param callback The callback to pass the items to
     * @returns A promise that resolves once all items have been generated
     */
    (callback: IGeneratorCallback<I>)=>Promise<void>