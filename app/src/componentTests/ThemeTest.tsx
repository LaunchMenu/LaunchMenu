import React, {FC} from "react";
import {PrimaryButton, TextField} from "@fluentui/react";
import {Box} from "../styling/box/Box";

export const ThemeTest: FC = () => (
    <div>
        <PrimaryButton>hoi</PrimaryButton>
        <TextField />
        <Box background="bgSecondary" padding={1} margin={2} elevation="extraSmall">
            oranges
        </Box>
        <Box background="primary" padding={1} margin={2} elevation="extraLarge">
            potatoes
        </Box>
    </div>
);
