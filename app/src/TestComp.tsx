import React, {FC, useState} from "react";
import {Box} from "./styling/box/Box";
import {useTheme} from "./styling/theming/ThemeContext";
import {PrimaryButton} from "@fluentui/react";

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
            potatoes
        </Box>
    );
};
