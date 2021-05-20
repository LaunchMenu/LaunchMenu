import React, {FC} from "react";
import {FillBox, mergeStyles} from "@launchmenu/core";
import {INoteScreenJSONProps, INoteScreenProps} from "./_types/INoteScreenProps";
import {createRemoteElementShower} from "./createRemoteElementShower";

/** A remark screen overlay */
export const NoteScreen: FC<INoteScreenProps> = ({
    children,
    backgroundProps,
    background = "bgPrimary",
    backgroundOpacity = 0.9,
    blur = 2,
    css,
    ...props
}) => (
    <FillBox
        {...props}
        css={mergeStyles(
            {
                fontSize: 30,
                backdropFilter: blur ? `blur(${blur}px)` : undefined,
            },
            css
        )}>
        <FillBox
            background={background}
            opacity={backgroundOpacity}
            zIndex={0}
            {...backgroundProps}
        />
        <FillBox
            padding="extraLarge"
            zIndex={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center">
            {children}
        </FillBox>
    </FillBox>
);

export const showRemoteNoteScreen = createRemoteElementShower<
    INoteScreenJSONProps & {children: string}
>(`${__filename}>NoteScreen`);
