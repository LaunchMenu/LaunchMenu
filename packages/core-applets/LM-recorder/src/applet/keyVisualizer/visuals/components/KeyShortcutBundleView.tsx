import React, {FC, Fragment} from "react";
import {IKey, KeyPattern} from "@launchmenu/core";
import {BigKeyView} from "./BigKeyView";
import {KeyView} from "./KeyView";

/**
 * A view to visualize key shortcut bundles
 */
export const KeyShortcutBundleView: FC<{keys: IKey[]; big?: boolean}> = ({keys, big}) => {
    const sortedKeys = KeyPattern.sortKeys(keys.map(key => key.name));

    return (
        <Fragment>
            {sortedKeys.map((key, i) => (
                <Fragment key={i}>
                    {i != 0 && "+"}
                    {big ? <BigKeyView>{key}</BigKeyView> : <KeyView>{key}</KeyView>}
                </Fragment>
            ))}
        </Fragment>
    );
};
