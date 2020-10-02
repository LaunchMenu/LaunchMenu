import {IUIModel} from "./_types/IUIModel";
import {Field, IDataHook} from "model-react";

/**
 * A base UI Model class that tracks the view count
 */
export abstract class AbstractUIModel implements IUIModel {
    protected viewCount = new Field(0);

    /**@override */
    public addViewCount(): void {
        this.viewCount.set(this.viewCount.get(null) + 1);
    }
    /**@override */
    public removeViewCount(): void {
        this.viewCount.set(this.viewCount.get(null) - 1);
    }
    /** @override */
    public getViewCount(hook: IDataHook = null): number {
        return this.viewCount.get(hook);
    }
    /** @override */
    public destroy(): void {}
}
