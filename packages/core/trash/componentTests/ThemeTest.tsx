import React, {FC} from "react";
import {Box} from "../../src/styling/box/Box";

export const ThemeTest: FC = () => (
    <div>
        <Box
            background="bgSecondary"
            padding="extraSmall"
            margin="large"
            elevation="extraSmall">
            oranges
        </Box>
        <Box background="primary" padding="small" margin="small" elevation="extraLarge">
            potatoes
        </Box>
    </div>
);
