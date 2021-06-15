import {Box, Button, Checkbox, makeStyles} from "@material-ui/core";
import {ipcRenderer, remote} from "electron";
import React, {FC, useEffect, useState} from "react";
import PuffLoader from "react-spinners/PuffLoader";
import {IState} from "../_types/IState";

const applets = {
    Dictionary: "@launchmenu/applet-dictionary",
    Notes: "@launchmenu/applet-notes",
};

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        flex: 1,
    },
}));

export const WindowUI: FC = () => {
    const classes = useStyles();
    const [state, setState] = useState({type: "loading", name: "Initializing"} as IState);
    useEffect(() => {
        ipcRenderer.send("ready");

        const listener = (event: any, newState: IState) => {
            setState(newState);
        };
        ipcRenderer.on("state", listener);
        return () => void ipcRenderer.off("state", listener);
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            p={1}
            alignItems="center"
            alignContent="center"
            justifyContent="center"
            css={{height: "100%"}}>
            {state.type == "loading" ? (
                <>
                    {state.name}
                    <Box mt={1} css={{width: 70}}>
                        <PuffLoader color="#00F" size={60} />
                    </Box>
                </>
            ) : state.type == "prompt" ? (
                <Box display="flex" flexDirection="column" width="100%" height="100%">
                    <Box
                        mb={1}
                        flex={1}
                        display="flex"
                        justifyContent="center"
                        alignItems="center">
                        {state.text}
                    </Box>
                    <Box display="flex" width="100%">
                        {state.buttons.map((button, i) => (
                            <Button
                                key={i}
                                className={classes.button}
                                variant="contained"
                                color={button.type == "primary" ? "primary" : "default"}
                                onClick={() => ipcRenderer.send("clickButton", i)}>
                                {button.text}
                            </Button>
                        ))}
                    </Box>
                </Box>
            ) : state.type == "finished" ? (
                <>
                    {state.name}
                    <Box>
                        Press{" "}
                        {process.platform == "win32"
                            ? "Windows+Space"
                            : remote.systemPreferences.isTrustedAccessibilityClient(false)
                            ? "Command+Space"
                            : "Command+L"}{" "}
                        or use the tray icon to open LM.
                    </Box>
                </>
            ) : (
                <InstallSelectionHandler />
            )}
        </Box>
    );
};

const InstallSelectionHandler: FC = () => {
    const [selectedApplets, setSelectedApplets] = useState(Object.keys(applets));
    const toggleApplet = (name: string) =>
        setSelectedApplets(applets => {
            if (applets.includes(name)) {
                const index = applets.indexOf(name);
                return [...applets.slice(0, index), ...applets.slice(index + 1)];
            } else {
                return [...applets, name];
            }
        });
    const onSubmit = () =>
        ipcRenderer.send(
            "selectApplets",
            selectedApplets.map((name: keyof typeof applets) => applets[name])
        );

    return (
        <>
            Please select the applets you want to install. <br /> As of right now, applets
            can't easily be installed later, but this will be added in the near future.
            <Box>
                {Object.keys(applets).map((name, i) => (
                    <Box key={name}>
                        <Checkbox
                            checked={selectedApplets.includes(name)}
                            onChange={() => toggleApplet(name)}
                        />
                        <Box display="inline" style={{verticalAlign: "middle"}}>
                            {name}
                        </Box>
                    </Box>
                ))}
            </Box>
            <Button role="button" variant="contained" color="primary" onClick={onSubmit}>
                Install
            </Button>
        </>
    );
};
