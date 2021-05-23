import {LaunchMenu} from "@launchmenu/core";
import {IDataRetriever} from "model-react";
import {bundleKeyPressEvents} from "./bundleKeyPressEvents";
import {IBundleKeyPressConfig} from "./_types/IBundleKeyPressConfig";
import {IKeyBundle} from "./_types/IKeyBundle";

/**
 * Sets up the key event listener
 * @param LM The LaunchMenu instance to use to listen to events from
 * @param config The configuration for the listener
 * @returns The result keys data source, and a function to dispose the listener
 */
export function setupKeyPressListener(
    LM: LaunchMenu,
    config?: IBundleKeyPressConfig
): {destroy: () => void; bundle: IDataRetriever<IKeyBundle>} {
    // Setup the key bundler
    const {bundle, onKey} = bundleKeyPressEvents(config);

    // Setup the listener
    const handler = LM.getKeyHandler();
    handler.listen(onKey);

    // Return the result
    return {
        bundle,
        destroy: () => handler.removeListener(onKey),
    };
}
