import {FormEvent} from "react";
import {ITextFieldProps} from "@fluentui/react";

export type IFocusedFieldProps = {
    onChange: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>, v: string) => void;
    /**
     * Whether or not this field is focused by default (at most 1 rendered element should be focused by default)
     */
    focused?: boolean;
} & Omit<ITextFieldProps, "onChange">;
