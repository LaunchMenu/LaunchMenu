import {IDataHook} from "model-react";
import {IViewStackItemView} from "../../uiLayers/_types/IViewStackItem";

/**
 * A standard content object
 */
export type IContent = {
    /**
     * The content view to show
     */
    readonly view: IViewStackItemView;

    /**
     * Sets the number of pixels that can be scrolled
     * @param height The available height that can be scrolled (difference between container and child height)
     */
    setScrollHeight(height: number): void;

    /**
     * Retrieves the scroll height
     * @param hook The hook to subscribe to changes
     * @returns The scroll height
     */
    getScrollHeight(hook?: IDataHook): number;

    /**
     * Sets the percentage of the area scrolled so far (between 0 and 1)
     * @param percentage The new scroll percentage
     */
    setScrollPercentage(percentage: number): void;

    /**
     * Retrieves the percentage of the area scrolled so far (between 0 and 1)
     * @param hook The hook to subscribe to changes
     * @returns The scroll percentage
     */
    getScrollPercentage(hook?: IDataHook): number;

    /**
     * Retrieves the number of pixels scrolled so far
     * @param scrollHeight The available height to scroll (defaults to the amount set on this content)
     * @param hook The hook to subscribe to changes
     * @returns The total scroll offset
     */
    getScrollOffset(scrollHeight?: number, hook?: IDataHook): number;
};
