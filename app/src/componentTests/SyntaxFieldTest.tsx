import React, {FC, useState} from "react";
import {TextField} from "../textFields/TextField";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {TextFieldView} from "../components/fields/TextFieldView";
import {doStuff, parser} from "../textFields/syntax/test";
import {SyntaxHighlighter} from "../components/fields/syntaxField/SyntaxHighlighter";
import {FillBox} from "../components/FillBox";
import {Box} from "../styling/box/Box";
import {useTheme} from "../styling/theming/ThemeContext";

doStuff();

const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField("I like trains.");
inputStack.push(createTextFieldKeyHandler(textField));

export const SyntaxFieldTest: FC = () => {
    const theme = useTheme();
    const [selection, setSelection] = useState({start: 4, end: 7});
    return (
        <FillBox background="bgPrimary">
            <TextFieldView
                css={{
                    boxShadow: "0 0 36px rgba(0, 0, 0, 0.1)",
                    margin: 8,
                    marginBottom: 0,
                    borderRadius: 4,

                    border: "1px solid #eee",
                }}
                icon={{iconName: "Search"}}
                textField={textField}
                zIndex={1}
            />
            <Box css={{fontSize: 30, paddingLeft: 30}}>
                <SyntaxHighlighter
                    highlighter={parser}
                    selection={selection}
                    onSelectionChange={setSelection}
                    theme={theme.highlighting}
                    value="(1 + 1) yes + ( 3 5"
                />
            </Box>
            <Box
                width={300}
                height={300}
                background={"bgSecondary"}
                css={{WebkitAppRegion: "drag"}}></Box>
        </FillBox>
    );
};
