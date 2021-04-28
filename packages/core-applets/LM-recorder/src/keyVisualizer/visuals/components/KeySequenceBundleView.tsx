import React, {FC, Fragment} from "react";
import {Box, IKey, KeyPattern} from "@launchmenu/core";
import {BigKeyView} from "./BigKeyView";
import {KeyView} from "./KeyView";

/**
 * A view to visualize key sequence bundles
 */
export const KeySequenceBundleView: FC<{keys: IKey[]; big?: boolean}> = ({keys, big}) => {
    const keySequence = keys.reduce(
        ({combined, lastKey, lastCount}, key) => {
            const duplicate = key.id == lastKey;
            const view =
                specialKeys[key.name as keyof typeof specialKeys]?.[
                    big ? "big" : "small"
                ] ?? key.char;
            if (!view) return {combined, lastKey, lastCount};

            return {
                combined: duplicate
                    ? [
                          ...combined.slice(0, combined.length - 1),
                          <RepeatKeyView count={lastCount + 1}>{view}</RepeatKeyView>,
                      ]
                    : [...combined, view],
                lastKey: key.id,
                lastCount: duplicate ? lastCount + 1 : 1,
            };
        },
        {combined: [] as JSX.Element[], lastKey: null, lastCount: 0}
    ).combined;

    return (
        <Box
            display="flex"
            flexDirection="row-reverse"
            whiteSpace="nowrap"
            maxWidth="100%">
            <Box>
                {keySequence.map((element, i) => (
                    <Fragment key={i}>{element}</Fragment>
                ))}
            </Box>
        </Box>
    );
};

const specialKeys = {
    backspace: {big: <BigKeyView>⌫</BigKeyView>, small: <KeyView>⌫</KeyView>},
    delete: {big: <BigKeyView>⌦</BigKeyView>, small: <KeyView>⌦</KeyView>},
    enter: {big: <BigKeyView>⏎</BigKeyView>, small: <KeyView>⏎</KeyView>},
    shift: {big: <BigKeyView>⇧</BigKeyView>, small: <KeyView>⇧</KeyView>},
    left: {big: <BigKeyView>←</BigKeyView>, small: <KeyView>←</KeyView>},
    right: {big: <BigKeyView>→</BigKeyView>, small: <KeyView>→</KeyView>},
    up: {big: <BigKeyView>↑</BigKeyView>, small: <KeyView>↑</KeyView>},
    down: {big: <BigKeyView>↓</BigKeyView>, small: <KeyView>↓</KeyView>},
    esc: {big: <BigKeyView>esc</BigKeyView>, small: <KeyView>esc</KeyView>},
    tab: {big: <BigKeyView>⇥</BigKeyView>, small: <KeyView>⇥</KeyView>},
} as const;

const RepeatKeyView: FC<{count: number}> = ({count, children}) => (
    <span>
        {children}
        <Box
            display="inline-block"
            backgroundColor="bgSecondary"
            borderRadius="round"
            verticalAlign="super"
            css={{fontSize: "0.5em"}}>
            {count}
        </Box>
    </span>
);
