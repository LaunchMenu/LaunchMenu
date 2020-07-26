import React, {
    FC,
    useState,
    useRef,
    useCallback,
    KeyboardEvent,
    ChangeEvent,
    useEffect,
} from "react";
import {ExtendedObject} from "../utils/ExtendedObject";
import {AceEditor} from "../components/fields/editorField/AceEditor";
import {TextField} from "../textFields/TextField";
import {EditorField} from "../components/fields/editorField/EditorField";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {useDataHook} from "../utils/modelReact/useDataHook";
import {TextFieldView} from "../components/fields/TextFieldView";
import {Box} from "../styling/box/Box";

const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField("potatoes");
inputStack.push(createTextFieldKeyHandler(textField));

export const InputFieldTest: FC = () => {
    return (
        <Box overflow="hidden" height="100%" display="flex" flexDirection="column">
            <TextFieldView
                icon={{iconName: "RingerSolid"}}
                textField={textField}
                zIndex={1}
            />
            <Box flexGrow={1} display="flex">
                <Box
                    css={{
                        WebkitAppRegion: "drag",
                    }}
                    elevation="medium"
                    shadowCut={["top"]}
                    width={280}
                    background="bgPrimary"></Box>
                <Box flexGrow={1} background="bgSecondary"></Box>
            </Box>
        </Box>
    );
};
