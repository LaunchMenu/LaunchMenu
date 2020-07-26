import {IBoxProps} from "../../../styling/box/_types/IBoxProps";
import {IIconProps} from "@fluentui/react";
import {ReactElement} from "react";
import {ITextField} from "../../../textFields/_types/ITextField";
import {IViewStackItemProps} from "../../../stacks/_types/IViewStackItemProps";

export type ITextFieldViewProps = {
    textField: ITextField;
    icon?: IIconProps | ReactElement;
} & IBoxProps;
