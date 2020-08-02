import React, {FC} from "react";
import {TextField} from "../textFields/TextField";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {MathParser} from "../textFields/syntax/_tests/MathInterpreter.helper";
import {FillBox} from "../components/FillBox";
import {Box} from "../styling/box/Box";
import {SyntaxField} from "../components/fields/syntaxField/SyntaxField";

const parser = new MathParser();
const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField(
    "I like trains and I want to go to the cinema to buy some jonkos for the boss."
);
inputStack.push(createTextFieldKeyHandler(textField, true));

export const SyntaxFieldTest: FC = () => {
    return (
        <FillBox background="bgPrimary">
            <Box css={{fontSize: 30, paddingLeft: 30}}>
                <SyntaxField highlighter={parser} field={textField} />
            </Box>
        </FillBox>
    );
};
