import React, {FC} from "react";
import {IContent} from "../../content/_types/IContent";
import {Box} from "../../styling/box/Box";
import {FillBox} from "../FillBox";
import {ContentScroller} from "./ContentScroller";

/**
 * A standard frame for content, allowing for keyboard scrolling and providing a standard padding
 */
export const ContentFrame: FC<{content: IContent}> = ({content, children}) => {
    return (
        <FillBox className="contentFrame" background="bgSecondary">
            <ContentScroller content={content}>
                <Box padding="medium">{children}</Box>
            </ContentScroller>
        </FillBox>
    );
};
