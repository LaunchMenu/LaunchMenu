import React, {FC} from "react";
import {Loader} from "@launchmenu/core";
import {IDataRetriever} from "model-react";
import {IKeyBundle} from "../retrieveKeys/_types/IKeyBundle";
import {IKeyVizProps} from "./components/_types/IKeyVizProps";
import {v4 as uuid} from "uuid";
import {KeyOverlayView} from "./components/KeyOverlayView";

/**
 * Creates the element to visualize the given keys data source
 * @param keys The keys to be visualized
 * @param Comp The component to be used
 * @returns The element
 */
export function createOverlayKeyVisualizer(
    keys: IDataRetriever<IKeyBundle>,
    Comp: FC<IKeyVizProps> = KeyOverlayView
): JSX.Element {
    return <Loader key={uuid()}>{h => <Comp keys={keys(h)} />}</Loader>;
}
