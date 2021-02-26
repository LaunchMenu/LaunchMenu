import {IField, IInputConfig} from "@launchmenu/core";
import Color from "color";
import React from "react";
import {ColorTextFieldView} from "../../../../../components/settings/inputs/ColorTextFieldView";
import {ITextField} from "../../../../../textFields/_types/ITextField";
import {Input} from "../../../../../uiLayers/types/input/Input";
import {IViewStackItem} from "../../../../../uiLayers/_types/IViewStackItem";

/**
 * An input layer for colors
 */
export class ColorInput extends Input<string> {
    /**
     * Creates a new color input
     * @param field The field to target
     */
    public constructor(field: IField<string>);

    /**
     * Creates a new color input
     * @param field The field to target
     * @param config The configuration for the field
     */
    public constructor(field: IField<string>, config: IInputConfig<string>);
    public constructor(field: IField<string>, config?: IInputConfig<string>) {
        super(field, {checkValidity: text => {
            try {
                new Color(text);
            } catch {
                return {
                    message: `'${text}' is not a valid color`,
                    ranges: [{start: 0, end: text.length}],
                };
            }
        }, ...config});
    }

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
