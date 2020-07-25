import React, {
    FC,
    useState,
    useRef,
    useCallback,
    KeyboardEvent,
    ChangeEvent,
    useEffect,
} from "react";
import {FocusedField} from "../components/fields/FocusedField";
import {ExtendedObject} from "../utils/ExtendedObject";
import {MainField} from "../components/fields/MainField";
import {AceEditor} from "../components/fields/editorField/AceEditor";
import {TextField} from "../textFields/TextField";
import {EditorField} from "../components/fields/editorField/EditorField";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createTextFieldKeyHandler} from "../textFields/interaction/keyHandler.ts/createTextFieldKeyHandler";
import {useDataHook} from "model-react";

const inputStack = new KeyHandlerStack(new KeyHandler(window));
const textField = new TextField("oranges are \n cool\n");
inputStack.push(createTextFieldKeyHandler(textField, true));

export const InputFieldTest: FC = () => {
    const ref = useRef<HTMLTextAreaElement>(null);
    const [index, setIndex] = useState(0);
    // const keyHandler = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    //     const target = e.target as HTMLInputElement;
    //     // if (e.key == "g") target.setSelectionRange(0, 4);
    // }, []);
    const changeHandler = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        textField.set(e.target.value);
        // target.setSelectionRange(4, 4);
    }, []);
    // useEffect(() => {
    //     const focusLostShit = () => {
    //         if (ref.current) ref.current.focus();
    //     };
    //     window.addEventListener("focusout", focusLostShit);
    //     return () => window.removeEventListener("focusout", focusLostShit);
    // });
    return (
        <div
            onKeyDown={e => {
                // console.log(e.key);
                // if (e.key == "ArrowRight") {
                //     const selection = textField.getSelection();
                //     textField.setSelection({
                //         start: selection.start + 1,
                //         end: selection.end + 1,
                //     });
                // }
                // if (e.key == "ArrowLeft") {
                //     const selection = textField.getSelection();
                //     textField.setSelection({
                //         start: selection.start - 1,
                //         end: selection.end - 1,
                //     });
                // }
                // e.preventDefault();
            }}>
            <textarea
                ref={ref}
                value={textField.get(useDataHook()[0])}
                // onKeyDown={keyHandler}
                onChange={changeHandler}
            />
            {/* <MainField
                focused
                icon={{iconName: "RingerSolid"}}
                value={value}
                // onKeyDown={keyHandler}
                onChange={changeHandler}
            /> */}
            {/* <AceEditor
                height={30}
                selection={{start: index, end: index}}
                value={value}
                options={{minLines: 1, maxLines: 10, readOnly: true}}
            /> */}
            <EditorField field={textField} height={50} />
        </div>
    );
};
