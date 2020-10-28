import React, {FC, useState, useEffect} from "react";
import {TextField} from "../../src/textFields/TextField";
import {KeyHandlerStack} from "../../src/stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../../src/stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../../src/textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {useDataHook} from "../../src/utils/modelReact/useDataHook";
import {TextFieldView} from "../../src/components/fields/TextFieldView";
import {Box} from "../../src/styling/box/Box";
import {FillBox} from "../../src/components/FillBox";
import {useTheme} from "../../src/styling/theming/ThemeContext";
import {Transition} from "../../src/components/stacks/transitions/Transition";
import {MathParser} from "../../src/textFields/syntax/_tests/MathInterpreter.helper";
import {dummyContext} from "../../src/_tests/context.helper";

const parser = new MathParser();
const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField("4* (4/3)");
inputStack.push(createTextFieldKeyHandler(textField, dummyContext));

export const InputFieldTest: FC = () => {
    const theme = useTheme();
    const [someShit, setSomeShit] = useState(0);

    const [h] = useDataHook();
    const value = textField.get(h);
    const [result, setResult] = useState(0 as string[] | number);
    useEffect(() => {
        const {result, errors} = parser.execute(value);
        if (result) setResult(result);
        else setResult(errors?.map(({message}) => message) || [""]);
    }, [value]);

    return (
        <Box
            overflow="hidden"
            position="relative"
            height={`calc(100% - ${2 * theme.spacing["medium"]}px)`}
            display="flex"
            borderRadius="large"
            flexDirection="column"
            margin="medium"
            elevation="medium">
            <FillBox opacity={1} css={{background: "#fafafa"}} zIndex={-1} />
            <TextFieldView
                css={{
                    boxShadow: "0 0 36px rgba(0, 0, 0, 0.1)",
                    margin: 8,
                    marginBottom: 0,
                    borderRadius: 4,

                    border: "1px solid #eee",
                }}
                highlighter={parser}
                icon="search"
                field={textField}
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
                    <FillBox opacity={1} css={{background: "#eeeeee"}} zIndex={-1}>
                        <Transition>
                            <Box margin="medium" padding="medium" key={someShit}>
                                I am a cool boi
                            </Box>
                        </Transition>
                    </FillBox>
                </Box>
                <Box
                    flexGrow={5}
                    padding="medium"
                    position="relative"
                    css={{WebkitAppRegion: "drag"}}>
                    <FillBox opacity={1} css={{background: "#fafafa"}} zIndex={-1} />
                    {result instanceof Array
                        ? result.map((m, i) => (
                              <Box key={i} css={{color: "red"}}>
                                  {m}
                              </Box>
                          ))
                        : result}
                </Box>
            </Box>
        </Box>
    );
};
