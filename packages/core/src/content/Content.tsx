import React from "react";
import {Field, IDataHook} from "model-react";
import {IViewStackItemView} from "../uiLayers/_types/IViewStackItem";
import {IContent} from "./_types/IContent";

/**
 * A standard content class to handle keyboard scrolling concerns
 */
export class Content implements IContent {
    public view: IViewStackItemView;

    protected scrollPercentage = new Field(0);
    protected scrollHeight = new Field(0);

    /**
     * Creates a new content instance
     * @param view The content to be shown
     */
    public constructor(view: IViewStackItemView = <></>) {
        this.view = view;
    }

    /**
     * Sets the number of pixels that can be scrolled
     * @param height The available height that can be scrolled (difference between container and child height)
     */
    public setScrollHeight(height: number): void {
        this.scrollHeight.set(height);
    }

    /**
     * Retrieves the scroll height
     * @param hook The hook to subscribe to changes
     * @returns The scroll height
     */
    public getScrollHeight(hook: IDataHook = null): number {
        return this.scrollHeight.get(hook);
    }

    /**
     * Sets the percentage of the area scrolled so far (between 0 and 1)
     * @param percentage The new scroll percentage
     */
    public setScrollPercentage(percentage: number): void {
        this.scrollPercentage.set(Math.max(0, Math.min(percentage, 1)));
    }

    /**
     * Retrieves the percentage of the area scrolled so far (between 0 and 1)
     * @param hook The hook to subscribe to changes
     * @returns The scroll percentage
     */
    public getScrollPercentage(hook: IDataHook = null): number {
        return this.scrollPercentage.get(hook);
    }

    /**
     * Retrieves the number of pixels scrolled so far
     * @param scrollHeight The available height to scroll (defaults to the amount set on this content)
     * @param hook The hook to subscribe to changes
     * @returns The total scroll offset
     */
    public getScrollOffset(scrollHeight?: number, hook: IDataHook = null): number {
        if (scrollHeight === undefined) scrollHeight = this.getScrollHeight(hook);
        return this.getScrollPercentage(hook) * scrollHeight;
    }
}
