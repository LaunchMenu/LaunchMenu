import React, {FC, FormEvent, useEffect, useRef, useCallback} from "react";
import {TextField, ITextField} from "@fluentui/react";
import {IFocusedFieldProps} from "./_types/IFocusedFieldProps";

export const FocusedField: FC<IFocusedFieldProps> = ({
    value,
    onChange,
    focused = true,
    componentRef,
    ...rest
}) => {
    let ref = useRef<ITextField | null>(null);
    useEffect(() => {
        if (focused) {
            const focusOutHandler = (e: FocusEvent) => {
                // If no new element was selected, reselect the current
                if (!e.relatedTarget) ref.current?.focus();
            };
            window.addEventListener("focusout", focusOutHandler);

            return () => window.removeEventListener("focusout", focusOutHandler);
        }
    }, [focused]);

    return (
        <TextField
            componentRef={useCallback(
                el => {
                    ref.current = el;
                    if (componentRef instanceof Function) componentRef(el);
                    else if (componentRef) (componentRef as any).current = el;
                },
                [componentRef]
            )}
            value={value}
            onChange={useCallback((e, v) => v !== undefined && e && onChange(e, v), [
                onChange,
            ])}
            {...rest}
        />
    );
};
