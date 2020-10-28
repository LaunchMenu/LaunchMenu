import React from "react";
import {ColorTextFieldView} from "../../../../../components/settings/inputs/ColorTextFieldView";
import {ITextField} from "../../../../../textFields/_types/ITextField";
import {Input} from "../../../../../uiLayers/types/input/Input";
import {IViewStackItem} from "../../../../../uiLayers/_types/IViewStackItem";

/**
 * An input layer for colors
 */
export class ColorInput extends Input<string> {
    /** @override */
    protected getFieldView(field: ITextField): IViewStackItem {
        return (
            <ColorTextFieldView
                field={field}
                icon={this.config.icon}
                highlighter={this.getHighlighterWithError(this.config.highlighter)}
            />
        );
    }
}
