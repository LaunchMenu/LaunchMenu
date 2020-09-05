import React from "react";
import {ITextFieldViewProps} from "../../fields/_types/ITextFieldViewProps";
import {useDataHook} from "../../../utils/modelReact/useDataHook";
import {TextFieldView} from "../../fields/TextFieldView";
import Color from "color";
import {LFC} from "../../../_types/LFC";

/**
 * A color text field view that changes the background color to the color of the input text
 */
export const ColorTextFieldView: LFC<ITextFieldViewProps> = ({field, ...rest}) => {
    const [h] = useDataHook();
    const value = field.get(h);
    let color: Color;
    try {
        color = new Color(value);
        return (
            <TextFieldView
                css={{backgroundColor: value, color: color.isDark() ? "#FFF" : "#000"}}
                field={field}
                {...rest}
            />
        );
    } catch {
        return <TextFieldView field={field} {...rest} />;
    }
};
