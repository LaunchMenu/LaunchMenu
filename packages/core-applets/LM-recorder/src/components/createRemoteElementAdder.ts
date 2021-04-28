import {IJSON} from "@launchmenu/core";
import {Controller} from "../controller/Controller";
import {IShowScreenConfig} from "../controller/_types/IShowScreenConfig";
import {IShowScreenResult} from "../controller/_types/IShowScreenResult";
import Path from "path";

/**
 * Creates a wrapper function to add intellisense to remote element usage
 * @param path The path to the component
 * @param defaultProps The standard props to supply
 * @returns A function that can be used to open the element
 */
export function createRemoteElementAdder<T extends Record<string, IJSON>>(
    path: string,
    defaultProps: T = {} as T
): {
    /**
     * Opens an element of the component in the given controller
     * @param controller The controller to open in
     * @param config The configuration for the element
     * @returns The controller for the element
     */
    (controller: Controller, config?: IShowScreenConfig<T>): Promise<
        IShowScreenResult<T>
    >;
    /** The path to the component */
    path?: string;
} {
    path = Path.resolve(path);
    const func = (controller: Controller, config?: IShowScreenConfig<T>) =>
        controller.showScreen<T>(path, {
            props: {...config?.props, ...defaultProps},
            ...config,
        });
    func.path = path;
    return func;
}
