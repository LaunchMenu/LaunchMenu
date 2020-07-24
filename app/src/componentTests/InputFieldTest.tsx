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

export const InputFieldTest: FC = () => {
    const ref = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");
    // const keyHandler = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    //     const target = e.target as HTMLInputElement;
    //     // if (e.key == "g") target.setSelectionRange(0, 4);
    // }, []);
    const changeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        setValue(e.target.value);
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
                console.log(e);
                // e.preventDefault();
            }}>
            <input
                ref={ref}
                value={value}
                // onKeyDown={keyHandler}
                onChange={changeHandler}
            />
            <MainField
                focused
                icon={{iconName: "RingerSolid"}}
                value={value}
                // onKeyDown={keyHandler}
                onChange={changeHandler}
            />
        </div>
    );
};
