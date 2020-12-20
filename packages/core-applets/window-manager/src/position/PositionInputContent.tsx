import {Box, Button, IField, IPosition, useDataHook} from "@launchmenu/core";
import {BrowserWindow, remote} from "electron";
import React, {FC, useEffect} from "react";

/**
 * A component for showing content to control the window position
 */
export const PositionInputContent: FC<{
    browserWindowField: IField<null | BrowserWindow>;
    field: IField<IPosition>;
}> = ({browserWindowField, field}) => {
    const [h] = useDataHook();
    const browserWindow = browserWindowField.get(h);
    useEffect(() => {
        if (!browserWindow) return;
        const positionListener = () => {
            const [x, y] = browserWindow.getPosition();
            field.set({x, y});
        };
        browserWindow.on("move", positionListener);
        return () => void browserWindow.removeListener("move", positionListener);
    }, [browserWindow]);

    const setPosition = (position: IPosition) => {
        if (!browserWindow) return;
        const displays = remote.screen.getAllDisplays().map(display => display.bounds);

        // Find the display to put the window in
        const {x, y} = field.get();
        const display =
            displays.find(
                display =>
                    display.x <= x &&
                    display.x + display.width > x &&
                    display.y <= y &&
                    display.y + display.height > y
            ) || remote.screen.getPrimaryDisplay().bounds;

        // Find the exact coordinates
        const windowWidth = window.document.body.clientWidth;
        const windowHeight = window.document.body.clientHeight;
        const newX = Math.round(display.x + (display.width - windowWidth) * position.x);
        const newY = Math.round(display.y + (display.height - windowHeight) * position.y);

        // Update the position
        field.set({x: newX, y: newY});
    };

    const positions = [
        [
            {x: 0, y: 0, name: "top left"},
            {x: 0.5, y: 0, name: "top"},
            {x: 1, y: 0, name: "top right"},
        ],
        [
            {x: 0, y: 0.5, name: "left"},
            {x: 0.5, y: 0.5, name: "middle"},
            {x: 1, y: 0.5, name: "right"},
        ],
        [
            {x: 0, y: 1, name: "bottom left"},
            {x: 0.5, y: 1, name: "bottom"},
            {x: 1, y: 1, name: "bottom right"},
        ],
    ];
    return (
        <Box>
            <Box
                padding="medium"
                background="secondary"
                borderRadius="small"
                css={{WebkitAppRegion: "drag", WebkitUserSelect: "none"} as any}>
                Click and drag here to move the window
            </Box>
            <Box>
                <Box marginY="medium">
                    Or click one of the buttons below to snap to a position
                </Box>
                <Box display="flex" flexDirection="column" gap="small">
                    {positions.map((row, i) => (
                        <Box display="flex" gap="small" key={i}>
                            {row.map(({x, y, name}, j) => (
                                <Button
                                    flexGrow={1}
                                    onClick={() => setPosition({x, y})}
                                    key={j}>
                                    {name}
                                </Button>
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};
