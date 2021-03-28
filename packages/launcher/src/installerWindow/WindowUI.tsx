import {Box, Button, Checkbox} from "@material-ui/core";
import {ipcRenderer} from "electron/renderer";
import React, {FC, useEffect, useState} from "react";
import PuffLoader from "react-spinners/PuffLoader";
import {IState} from "../_types/IState";

const applets = {
    Dictionary: "@launchmenu/applet-dictionary@alpha",
    Notes: "@launchmenu/applet-notes@alpha",
};

export const WindowUI: FC = () => {
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
            ) : state.type == "finished" ? (
                <>
                    {state.name}
                    <Box>Press ctrl+o or use the tray icon to open LM.</Box>
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
