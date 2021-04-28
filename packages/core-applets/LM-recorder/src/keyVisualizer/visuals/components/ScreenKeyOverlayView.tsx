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
import {KeySequenceBundleView} from "./KeySequenceBundleView";
import {KeyShortcutBundleView} from "./KeyShortcutBundleView";
import {IKeyVizProps} from "./_types/IKeyVizProps";

/**
 * The view to render the keyboard inputs as an overlay to the entire screen
 */
export const ScreenKeyOverlayView: FC<IKeyVizProps> = ({keys}) => {
    return (
        <FillBox display="flex" flexDirection="column">
            <Box flexGrow={5} />
            <Box
                position="relative"
                height={120}
                css={{
                    fontSize: 100,
                }}>
                <FadeTransition deps={[!keys.keys.length]}>
                    {keys.keys.length > 0 ? (
                        <FillBox>
                            <FillBox background="bgSecondary" opacity={0.5} />
                            <FadeTransition deps={[keys.ID, !keys.keys.length]}>
                                <FillBox
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center">
                                    {keys.type == "shortcut" ? (
                                        <KeyShortcutBundleView keys={keys.keys} big />
                                    ) : (
                                        <KeySequenceBundleView keys={keys.keys} big />
                                    )}
                                </FillBox>
                            </FadeTransition>
                        </FillBox>
                    ) : (
                        <Fragment />
                    )}
                </FadeTransition>
            </Box>
            <Box flexGrow={1} />
        </FillBox>
    );
};
