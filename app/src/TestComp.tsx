import React, {FC, useState} from "react";
import {useTheme} from "./styling/theming/ThemeContext";
import {PrimaryButton} from "@fluentui/react";
import {Box} from "./styling/box/Box";
import {Truncated} from "./components/Truncated";
import {MenuItemIcon} from "./menus/items/components/MenuItemIcon";

export const TestComp: FC = () => {
    const [count, setCount] = useState(0);
    const theme = useTheme();

    return (
        <Box
            color={count % 2 == 0 ? "primary" : "black"}
            background="neutral6"
            padding={3}
            css={{
                ":hover": {
                    background: theme.colors.neutral8,
                },
            }}
            onClick={() => setCount(c => c + 1)}>
            <PrimaryButton>poop</PrimaryButton>
            oranges
            <Truncated title="shit" lines={2}>
                Hello World this is a very long amazing text string which is very cool and
                I like it very much and stuff :)
            </Truncated>
            <Box width={200} height={200}>
                <MenuItemIcon icon="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fvtk.org%2FWiki%2Fimages%2F0%2F03%2FVTK_Examples_Baseline_IO_TestReadTIFF.png" />
            </Box>
        </Box>
    );
};
