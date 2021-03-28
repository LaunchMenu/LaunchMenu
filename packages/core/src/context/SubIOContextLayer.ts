import {IDataHook} from "model-react";
import {UnifiedAbstractUILayer} from "../uiLayers/standardUILayer/UnifiedAbstractUILayer";
import {IUILayerData} from "../uiLayers/standardUILayer/_types/IUILayerData";
import {IIOContext} from "./_types/IIOContext";

/**
 * A UILayer that can be used to use one context as a sub-context for another context
 */
export class SubIOContextLayer extends UnifiedAbstractUILayer {
    protected subContext: IIOContext;

    /**
     * Creates a new sub context UI layer
     * @param subContext The sub-context to be shown
     */
    public constructor(subContext: IIOContext) {
        super();
        this.subContext = subContext;
    }

    /** @override */
    public getAll(hook?: IDataHook): IUILayerData[] {
        return this.subContext.getUI(hook);
    }

    /** @override */
    protected initialize(): void {
        // No initialization is required
    }
}
