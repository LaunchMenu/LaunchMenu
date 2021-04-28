import {DataCacher, IDataRetriever} from "model-react";
import {IRemoteElement} from "../../overlays/window/_types/IRemoteElement";
import {v4 as uuid} from "uuid";
import Path from "path";
import {IKeyBundle} from "../retrieveKeys/_types/IKeyBundle";

/**
 * Creates the remote element data source to visualize the given keys data source
 * @param keys The keys to be visualized
 * @param componentPath The absolute path to the component to use for the visualization
 * @returns The remote element source
 */
export function createScreenOverlayKeyVisualizer(
    keys: IDataRetriever<IKeyBundle>,
    componentPath: string = `${__dirname}/components/ScreenKeyOverlayView>ScreenKeyOverlayView`
): IDataRetriever<IRemoteElement> {
    const ID = uuid();
    const path = Path.resolve(componentPath);
    const cache = new DataCacher(
        (h): IRemoteElement => {
            const current = keys(h);
            return {
                componentPath: path,
                key: ID,
                props: {
                    keys: current,
                },
            };
        }
    );
    return h => cache.get(h);
}
