import React, {FC} from "react";
import {TextField} from "../../src/textFields/TextField";
import {KeyHandlerStack} from "../../src/stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../../src/stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../../src/textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {MathParser} from "../../src/textFields/syntax/_tests/MathInterpreter.helper";
import {FillBox} from "../../src/components/FillBox";
import {Box} from "../../src/styling/box/Box";
import {SyntaxField} from "../../src/components/fields/syntaxField/SyntaxField";
import {dummyContext} from "../../src/_tests/context.helper";

const parser = new MathParser();
const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField(
    "I like trains and I want to go to the cinema to buy some jonkos for the boss."
);
inputStack.push(createTextFieldKeyHandler(textField, dummyContext, () => {}, true));

export const SyntaxFieldTest: FC = () => {
    return (
        <FillBox background="bgPrimary">
            <Box css={{fontSize: 30, paddingLeft: 30}}>
                <SyntaxField highlighter={parser} field={textField} />
            </Box>
        </FillBox>
    );
};
