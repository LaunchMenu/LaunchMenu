import React, {isValidElement} from "react";
import {IContent} from "../../content/_types/IContent";
import {IViewStackItemProps} from "../../uiLayers/_types/IViewStackItemProps";
import {LFC} from "../../_types/LFC";
import {ContentFrame} from "./ContentFrame";

/**
 * The standard content view element, adding padding, correctly representing scroll, and showing the content's view
 */
export const ContentView: LFC<{content: IContent} & IViewStackItemProps> = ({
    content,
    ...rest
}) => {
    const View = content.view as any;
    const element = isValidElement(View) ? View : <View {...rest} />;

    return <ContentFrame content={content}>{element}</ContentFrame>;
};
