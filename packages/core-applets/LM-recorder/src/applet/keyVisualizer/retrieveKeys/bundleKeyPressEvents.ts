import {IKey, KeyEvent} from "@launchmenu/core";
import {DataCacher, Field, IDataRetriever} from "model-react";
import {IBundleKeyPressConfig} from "./_types/IBundleKeyPressConfig";
import {IKeyBundle} from "./_types/IKeyBundle";
import {IKeyBundleType} from "./_types/IKeyBundleType";

/**
 * Bundles the key events together
 * @param config The configuration for the bundling
 * @returns The bundle and the key listener to pass events to be bundled
 */
export function bundleKeyPressEvents({
    duration = 3000,
    maxLength = 40,
    includeTyping = true,
}: IBundleKeyPressConfig = {}): {
    /** The data source with bundled events */
    bundle: IDataRetriever<IKeyBundle>;
    /** The key listener to pass keys to in order to bundle them */
    onKey: (keyEvent: KeyEvent) => void;
} {
    const ID = new Field(0);
    const keys = new Field<IKey[]>([]);
    const type = new Field<IKeyBundleType>("keySequence");
    let timeoutID: number;
    let splitNext = false;

    // Define some functions for updating bundles
    function clearBundle() {
        keys.set([]);
        clearTimeout(timeoutID);
    }
    function newBundle() {
        clearBundle();
        ID.set(ID.get() + 1);
        splitNext = false;
        timeoutID = setTimeout(clearBundle, duration) as any;
    }
    function extendTimeout() {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(clearBundle, duration) as any;
    }

    // Create the actual function that will set the bundle contents
    return {
        onKey: event => {
            const isDownOrRepeat = ["down", "repeat"].includes(event.type);
            if (!isDownOrRepeat) {
                if (type.get() == "shortcut") splitNext = true;
                return;
            }

            // Create a new bundle if needed
            const isPattern =
                event.ctrl ||
                event.alt ||
                event.meta ||
                ["meta", "alt", "ctrl"].includes(event.key.name);
            if (isPattern != (type.get() == "shortcut") && isDownOrRepeat) newBundle();
            if (splitNext) newBundle();

            // Update the bundle
            if (isPattern) {
                keys.set(event.type == "down" ? [...event.held, event.key] : event.held);
                extendTimeout();
                type.set("shortcut");
            } else if (includeTyping) {
                let oldKeys = keys.get();
                if (keys.get().length == maxLength) oldKeys = oldKeys.slice(1);
                keys.set([...oldKeys, event.key]);
                extendTimeout();
                type.set("keySequence");
            }
        },
        // Combine the data
        bundle: h =>
            new DataCacher(h => ({
                ID: ID.get(h),
                keys: keys.get(h),
                type: type.get(h),
            })).get(h),
    };
}
