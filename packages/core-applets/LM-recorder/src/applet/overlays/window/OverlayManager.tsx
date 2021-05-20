import React, {FC, Fragment, useEffect, useState} from "react";
import {ipcRenderer} from "electron";
import {IRemoteElement} from "./_types/IRemoteElement";
import {ILatentElement} from "./_types/ILatentElement";
import {FillBox, ITheme, ThemeProvider} from "@launchmenu/core";
import {FadeTransition} from "../../components/FadeTransition";

/**
 * The app that renders the elements that are specified remotely
 */
export const OverlayManager: FC = () => {
    const [state, setState] = useState({});
    const [comps, setComps] = useState<ILatentElement[]>([]);
    const [theme, setTheme] = useState<ITheme>();

    useEffect(() => {
        const onUpdateState = (event: Electron.IpcRendererEvent, state: object) =>
            setState(state);
        const onUpdateComps = (
            event: Electron.IpcRendererEvent,
            comps: IRemoteElement[]
        ) =>
            setComps(prevComps => {
                // The components to show
                const newComps = comps
                    .map(({componentPath, ...rest}) => {
                        try {
                            const Component = importPath(componentPath);
                            return {Component, visible: true, ...rest};
                        } catch (e) {
                            console.error(
                                `Could not load component at path ${componentPath}`
                            );
                            console.error(e);
                        }
                    })
                    .filter((comp): comp is ILatentElement => !!comp);

                // Add all the old components back in
                const now = Date.now();
                return [
                    ...newComps,
                    ...prevComps
                        .map(oldComp => {
                            if (!oldComp.fadeOut) return;
                            if (
                                oldComp.removalTime &&
                                now > oldComp.removalTime + oldComp.fadeOut
                            )
                                return;
                            if (newComps.find(comp => comp.key == oldComp.key)) return;

                            return {
                                removalTime: now,
                                ...oldComp,
                                visible: false,
                            } as ILatentElement;
                        })
                        .filter((comp): comp is ILatentElement => !!comp),
                ];
            });
        const onUpdateTheme = (
            event: Electron.IpcRendererEvent,
            path: string | undefined
        ) => {
            if (!path) {
                setTheme(undefined);
            } else {
                try {
                    const theme = importPath(path);
                    setTheme(theme);
                } catch (e) {
                    console.error(`Could not load component at path ${path}`);
                    console.error(e);
                }
            }
        };

        ipcRenderer.on("updateState", onUpdateState);
        ipcRenderer.on("updateComps", onUpdateComps);
        ipcRenderer.on("updateTheme", onUpdateTheme);

        return () => {
            ipcRenderer.off("updateState", onUpdateState);
            ipcRenderer.off("updateComps", onUpdateComps);
            ipcRenderer.off("updateTheme", onUpdateTheme);
        };
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <FillBox font="paragraph" cursor="none">
                {comps.map(({Component, key, props, visible, fadeIn, fadeOut}) => {
                    const el = <Component key={key} {...state} {...props} />;
                    const fade = fadeIn || fadeOut;
                    if (!fade) return el;
                    return (
                        <FadeTransition
                            key={key}
                            deps={[visible]}
                            inDuration={fadeIn}
                            outDuration={fadeOut}>
                            {visible ? el : <Fragment key={key} />}
                        </FadeTransition>
                    );
                })}
            </FillBox>
        </ThemeProvider>
    );
};

/**
 * Imports the given path
 * @param importPath The path to be imported
 * @returns The component that was found
 */
function importPath(importPath: string) {
    const parts = importPath.split(">");
    const path = parts[0];
    const field = parts[1];
    const exports = require(path);
    return exports[field || "default"];
}
