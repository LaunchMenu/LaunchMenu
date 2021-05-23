import {IJSON} from "@launchmenu/core";
import Path from "path";
import {IShowScreenConfig} from "../overlays/_types/IShowScreenConfig";
import {IShowScreenResult} from "../overlays/_types/IShowScreenResult";
import {Visualizer} from "../overlays/Visualizer";

/**
 * Creates a wrapper function to add intellisense to remote element usage
 * @param path The path to the component
 * @param defaultProps The standard props to supply
 * @returns A function that can be used to open the element
 */
export function createRemoteElementShower<T extends Record<string, IJSON>>(
    path: string,
    defaultProps: T = {} as T
): {
    /**
     * Opens an element of the component in the given visualizer
     * @param visualizer The visualizer to open in
     * @param config The configuration for the element
     * @returns The controller for the element
     */
    (visualizer: Visualizer, config?: IShowScreenConfig<T>): Promise<
        IShowScreenResult<T>
    >;
    /** The path to the component */
    path?: string;
} {
    path = Path.resolve(path);
    const func = (visualizer: Visualizer, config?: IShowScreenConfig<T>) =>
        visualizer.showScreen<T>(path, {
            ...config,
            props: {...defaultProps, ...config?.props},
        });
    func.path = path;
    return func;
}
