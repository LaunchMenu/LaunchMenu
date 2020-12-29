import React, {FC} from "react";
import {IContent} from "../../content/_types/IContent";
import {Box} from "../../styling/box/Box";
import {useTheme} from "../../styling/theming/ThemeContext";
import {FillBox} from "../FillBox";
import {ContentScroller} from "./ContentScroller";

/**
 * A standard frame for content, allowing for keyboard scrolling and providing a standard padding
 */
export const ContentFrame: FC<{content: IContent}> = ({content, children}) => {
    const theme = useTheme();
    return (
        <FillBox className="contentFrame" background="bgSecondary">
            <ContentScroller content={content} display="flex" flexDirection="column">
                <Box padding="medium" flex={"1 1 auto"}>
                    {children}
                </Box>
            </ContentScroller>
        </FillBox>
    );
};
