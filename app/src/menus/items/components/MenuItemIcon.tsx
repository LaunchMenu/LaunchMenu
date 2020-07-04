import {FC} from "react";
import React from "react";
import {Box} from "../../../styling/box/Box";

export const MenuItemIcon: FC<{icon: string}> = ({icon}) => (
    <Box
        width={20}
        css={{
            backgroundImage: icon,
            backgroundRepeat: "no-repeat",
            backgroundSize: "fit",
            color: "orange",
        }}>
        Poop
    </Box>
);
