import {Box, IField, ISize, useDataHook} from "@launchmenu/core";
import {BrowserWindow} from "electron";
import React, {FC, useEffect} from "react";

/**
 * A component for showing content to control the window size
 */
export const SizeInputContent: FC<{
    browserWindowField: IField<null | BrowserWindow>;
    field: IField<ISize>;
}> = ({browserWindowField, field}) => {
    const [h] = useDataHook();

    const browserWindow = browserWindowField.get(h);
    useEffect(() => {
        if (!browserWindow) return;
        const resizeListener = () => {
            const [width, height] = browserWindow.getSize();
            field.set({width, height});
        };
        browserWindow.on("resize", resizeListener);

        browserWindow.setResizable(true);
        return () => {
            browserWindow.removeListener("resize", resizeListener);
            browserWindow.setResizable(false);
        };
    }, [browserWindow]);

    return (
        <Box>
            <Box marginY="medium">
                Drag the edges (a little outside the edges) to resize the window
            </Box>
        </Box>
    );
};
