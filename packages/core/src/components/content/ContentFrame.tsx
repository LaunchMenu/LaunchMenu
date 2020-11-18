import React, {FC} from "react";
import {IContent} from "../../content/_types/IContent";
import {Box} from "../../styling/box/Box";
import {ContentScroller} from "./ContentScroller";

/**
 * A standard frame for content, allowing for keyboard scrolling and providing a standard padding
 */
export const ContentFrame: FC<{content: IContent}> = ({content, children}) => {
    return (
        <ContentScroller content={content}>
            <Box padding="medium">{children}</Box>
        </ContentScroller>
    );
};
