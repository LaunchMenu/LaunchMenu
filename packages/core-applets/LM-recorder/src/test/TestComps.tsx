import React, {FC} from "react";
import {Box} from "@launchmenu/core";

export const TestComp: FC<{value: number}> = ({value = 200}) => {
    return (
        <Box
            background="primary"
            style={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                opacity: 0.5,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 60,
            }}>
            {value}
        </Box>
    );
};
