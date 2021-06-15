import React, {FC} from "react";
import {Box, FillBox, IBoxProps, mergeStyles} from "@launchmenu/core";
import {ITitleScreenJSONProps, ITitleScreenProps} from "./_types/ITitleScreenProps";
import {createRemoteElementShower} from "./createRemoteElementShower";

/**
 * The screen overlay
 */
export const TitleScreen: FC<ITitleScreenProps & IBoxProps> = ({
    title,
    description,
    list,
    children,
    background = "#ffffff",
    bigScreen: monitor,
    ...rest
}) => (
    <FillBox
        padding="extraLarge"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        zIndex={100}
        {...rest}
        css={mergeStyles(
            {
                background,
                fontSize: monitor ? 100 : 50,
            },
            rest.css
        )}>
        {title && (
            <Box marginBottom="large" color="primary" css={{fontSize: "1.5em"}}>
                {title}
            </Box>
        )}
        {description && (
            <Box marginBottom="large" css={{fontSize: "1em"}}>
                {description}
            </Box>
        )}
        {list && (
            <Box css={{fontSize: "0.8em"}} margin="none" as="ul">
                {list.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </Box>
        )}
    </FillBox>
);
export const showRemoteTitleScreen = createRemoteElementShower<ITitleScreenJSONProps>(
    `${__filename}>TitleScreen`,
    {bigScreen: true}
);
