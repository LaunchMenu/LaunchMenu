import {Box, Button, Checkbox} from "@material-ui/core";
import {ipcRenderer} from "electron/renderer";
import React, {FC, useEffect, useState} from "react";
import PuffLoader from "react-spinners/PuffLoader";

type State = {type: "loading" | "configuring"; name: string};

const applets = {
    Example1: "Example1",
    Example2: "Example2",
};

export const WindowUI: FC = () => {
    const [state, setState] = useState({type: "loading", name: "Initializing"} as State);
    useEffect(() => {
        ipcRenderer.send("ready");

        const listener = (event: any, newState: State) => {
            setState(newState);
        };
        ipcRenderer.on("state", listener);
        return () => void ipcRenderer.off("state", listener);
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
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
            Please select the applets you want to install
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
            <Button role="button" onClick={onSubmit}>
                Install
            </Button>
        </>
    );
};
