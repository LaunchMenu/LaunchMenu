import React from "react";
import {IColorInputExecuteData} from "./_types/IColorInputExecuteData";
import Color from "color";
import {inputFieldExecuteHandler} from "../../../../../textFields/types/inputField/InputFieldExecuteHandler";
import {IInputFieldExecuteData} from "../../../../../textFields/types/inputField/_types/IInputFieldExecuteData";
import {results} from "../../../../actions/Action";
import {TextField} from "../../../../../textFields/TextField";
import {ColorTextFieldView} from "../../../../../components/settings/inputs/ColorTextFieldView";
import {openUI} from "../../../../../context/openUI/openUI";

//TODO: make a more advanced color input editor in accordance to the planning file
/**
 * A simple execute handler for updating color fields
 */
export const colorInputExecuteHandler = inputFieldExecuteHandler.createHandler(
    (data: IColorInputExecuteData[]) => ({
        [results]: data.map(
            ({field, context, liveUpdate, undoable}): IInputFieldExecuteData<string> => ({
                field,
                context,
                undoable,
                config: {
                    liveUpdate: liveUpdate as any,
                    checkValidity: text => {
                        try {
                            new Color(text);
                        } catch {
                            return {
                                message: `'${text}' is not a valid color`,
                                ranges: [{start: 0, end: text.length}],
                            };
                        }
                    },
                },
                // Use the color text field for the visualization
                openUI: (context, ui, onClose) =>
                    openUI(
                        context,
                        "highlighter" in ui &&
                            "field" in ui &&
                            ui.field instanceof TextField
                            ? {
                                  ...ui,
                                  fieldView: (
                                      <ColorTextFieldView
                                          highlighter={ui.highlighter}
                                          field={ui.field}
                                      />
                                  ),
                              }
                            : ui,
                        onClose
                    ),
            })
        ),
    })
);
