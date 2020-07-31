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
import {FillBox} from "../components/FillBox";
import {useTheme} from "../styling/theming/ThemeContext";
import {SlideOpenTransition} from "../components/stacks/transitions/open/SlideOpenTransition";
import {Transition} from "../components/stacks/transitions/Transition";

const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField("I like trains.");
inputStack.push(createTextFieldKeyHandler(textField));

export const InputFieldTest: FC = () => {
    const theme = useTheme();
    const [someShit, setSomeShit] = useState(0);
    return (
        <Box
            overflow="hidden"
            position="relative"
            height={`calc(100% - ${2 * theme.spacing(2)}px)`}
            display="flex"
            borderRadius={1 / 2}
            flexDirection="column"
            margin={2}
            elevation="medium">
            <FillBox opacity={1} backgroundCustom="#fafafa" zIndex={-1} />
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
            <Box flexGrow={1} display="flex">
                <Box
                    onClick={() => setSomeShit(i => i + 1)}
                    css={{
                        // WebkitAppRegion: "drag",

                        margin: 8,
                        marginTop: 0,
                        borderBottomLeftRadius: 4,
                        borderBottomRightRadius: 4,
                        overflow: "hidden",
                    }}
                    flexGrow={3}
                    position="relative">
                    <FillBox opacity={1} backgroundCustom="#eeeeee" zIndex={-1}>
                        <Transition>
                            <Box
                                backgroundCustom={"orange"}
                                margin={1}
                                padding={1}
                                key={someShit}>
                                I am a cool boi
                            </Box>
                        </Transition>
                    </FillBox>
                </Box>
                <Box
                    flexGrow={5}
                    padding={2}
                    position="relative"
                    css={{WebkitAppRegion: "drag"}}>
                    <FillBox opacity={1} backgroundCustom="#fafafa" zIndex={-1} />
                </Box>
            </Box>
        </Box>
    );
};
