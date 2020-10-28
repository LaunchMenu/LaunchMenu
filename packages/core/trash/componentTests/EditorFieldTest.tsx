import React, {FC} from "react";
import {TextField} from "../../src/textFields/TextField";
import {EditorField} from "../../src/components/fields/editorField/EditorField";
import {KeyHandlerStack} from "../../src/stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../../src/stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../../src/textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {FillBox} from "../../src/components/FillBox";
import {dummyContext} from "../../src/_tests/context.helper";

const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField("I like trains.");
inputStack.push(createTextFieldKeyHandler(textField, dummyContext, () => {}, true));

require("ace-builds/src-noconflict/mode-javascript");
export const EditorFieldTest: FC = () => {
    return (
        <FillBox opacity={1} background="bgPrimary" zIndex={-1}>
            <EditorField
                field={textField}
                options={{
                    mode: "ace/mode/javascript",
                }}
                zIndex={1}
            />
        </FillBox>
    );
};