import React, {cloneElement, isValidElement} from "react";
import {IContent} from "../../content/_types/IContent";
import {IViewStackItemProps} from "../../uiLayers/_types/IViewStackItemProps";
import {LFC} from "../../_types/LFC";
import {ContentFrame} from "./ContentFrame";
import {ContentScroller} from "./ContentScroller";

/**
 * The standard content view element, adding padding, correctly representing scroll, and showing the content's view
 */
export const ContentView: LFC<
    {
        content: IContent;
        /** Whether to not apply formatting */
        plain?: boolean;
    } & IViewStackItemProps
> = ({content, plain, ...rest}) => {
    const View = content.view as any;
    const element = isValidElement(View) ? cloneElement(View, rest) : <View {...rest} />;

    return plain ? (
        <ContentScroller content={content}>{element}</ContentScroller>
    ) : (
        <ContentFrame content={content}>{element}</ContentFrame>
    );
};
