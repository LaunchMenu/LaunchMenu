import {
    Box,
    FadeChangeTransition,
    FadeCloseTransition,
    FadeOpenTransition,
    FillBox,
    Transition,
    useDeepMemo,
} from "@launchmenu/core";
import {Field, Loader} from "model-react";
import React, {FC, Fragment} from "react";
import {FadeTransition} from "../../../components/FadeTransition";
import {Overlay} from "../../../components/Overlay";
import {KeySequenceBundleView} from "./KeySequenceBundleView";
import {KeyShortcutBundleView} from "./KeyShortcutBundleView";
import {IKeyVizProps} from "./_types/IKeyVizProps";

/**
 * The view to render the keyboard inputs as an overlay to the entire screen
 */
export const KeyOverlayView: FC<IKeyVizProps> = ({keys}) => {
    return (
        <FadeTransition deps={[!keys.keys.length]}>
            {keys.keys.length > 0 ? (
                <Overlay
                    maxWidth={300}
                    height={50}
                    right="none"
                    css={{bottom: 100, fontSize: 30}}>
                    <FadeTransition deps={[keys.ID, !keys.keys.length]}>
                        <Box
                            display="flex"
                            minWidth={150}
                            justifyContent="center"
                            alignItems="center"
                            paddingRight="extraLarge">
                            {keys.type == "shortcut" ? (
                                <KeyShortcutBundleView keys={keys.keys} />
                            ) : (
                                <KeySequenceBundleView keys={keys.keys} />
                            )}
                        </Box>
                    </FadeTransition>
                </Overlay>
            ) : (
                <Fragment />
            )}
        </FadeTransition>
    );
};
