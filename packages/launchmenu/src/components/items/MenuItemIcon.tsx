import React from "react";
import {Box} from "../../styling/box/Box";
import {LFC} from "../../_types/LFC";

export const MenuItemIcon: LFC<{icon: string}> = ({icon}) => (
    <Box
        width={20}
        css={{
            backgroundImage: `url(${icon})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            width: "100%",
            height: "100%",
        }}
    />
);
