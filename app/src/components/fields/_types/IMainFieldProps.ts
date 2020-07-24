import {IFocusedFieldProps} from "./IFocusedFieldProps";
import {IIconProps} from "@fluentui/react";
import {ReactElement} from "react";

export type IMainFieldProps = {
    icon?: IIconProps | ReactElement;
} & IFocusedFieldProps;
