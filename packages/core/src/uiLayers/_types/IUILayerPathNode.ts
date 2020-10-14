import {IUILayer} from "./IUILayer";

/** A node for UILayer paths */
export type IUILayerPathNode = {
    /** The name of this node */
    name: string;
    /** The layer type that the node is for */
    layer?: IUILayer;
};
