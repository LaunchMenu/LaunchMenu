import React, {FC, useCallback} from "react";
import Path from "path";
import {FillBox} from "../../components/FillBox";
import {LFC} from "../../_types/LFC";
import {Box} from "../../styling/box/Box";
import {IBoxProps} from "../../styling/box/_types/IBoxProps";
import {ThemeIcon} from "../../components/ThemeIcon";
import {useLMSession} from "../hooks/useLMSession";

/**
 * A component to show some general LM information
 */
export const ShortAboutLM: LFC<IBoxProps> = props => {
    const session = useLMSession();
    const showHelp = useCallback(() => {
        session?.searchField.set(":help");
    }, [session]);

    return (
        <FillBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            {...props}>
            <img
                src={Path.join(
                    __dirname,
                    "..",
                    "..",
                    "..",
                    "images",
                    "LaunchMenu-Logo-Cropped.png"
                )}
                style={{width: "100%", objectFit: "contain"}}
            />
            <Box display="inline-flex" width="100%" marginTop="large">
                <Container marginRight="medium">
                    <ThemeIcon icon="search" />
                    <span> Enter a query to get started</span>
                </Container>
                <Container marginRight="medium">
                    Use{" "}
                    <Key>
                        <ThemeIcon icon="arrowUp" />
                    </Key>{" "}
                    <Key>
                        <ThemeIcon icon="arrowDown" />
                    </Key>{" "}
                    and{" "}
                    <Key>
                        <ThemeIcon icon="return" />
                    </Key>{" "}
                    to navigate
                </Container>
                <Container cursor="pointer" onClick={showHelp}>
                    Type{" "}
                    <Box display="inline" css={{fontFamily: "consolas"}} color="primary">
                        :help
                    </Box>{" "}
                    for more information
                </Container>
            </Box>
            <Box display="inline-flex" width="100%" marginTop="large">
                <Container
                    width="50%"
                    css={theme => ({marginRight: theme.spacing.medium / 2})}>
                    Learn more at{" "}
                    <a href="https://launchmenu.github.io/">launchmenu.github.io</a>
                </Container>
                <Container
                    width="50%"
                    css={theme => ({marginLeft: theme.spacing.medium / 2})}>
                    LaunchMenu is open source, contribute at{" "}
                    <a href="https://github.com/LaunchMenu/LaunchMenu">
                        github.com/LaunchMenu
                    </a>
                </Container>
            </Box>
        </FillBox>
    );
};

const Container: FC<IBoxProps> = ({children, ...props}) => (
    <Box
        background="bgPrimary"
        elevation="small"
        padding="medium"
        flex="1 1 auto"
        {...props}>
        {children}
    </Box>
);

const Key: FC = ({children}) => (
    <Box
        display="inline-flex"
        verticalAlign="bottom"
        background="bgTertiary"
        css={{fontFamily: "consolas"}}>
        {children}
    </Box>
);
