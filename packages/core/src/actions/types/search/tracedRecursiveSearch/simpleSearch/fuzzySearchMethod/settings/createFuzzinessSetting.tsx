import {Loader} from "model-react";
import React from "react";
import {createStandardMenuItem} from "../../../../../../../menus/items/createStandardMenuItem";
import {createFieldMenuItem} from "../../../../../../../menus/items/inputs/createFieldMenuItem";
import {promptSelectExecuteHandler} from "../../../../../../../uiLayers/types/select/promptSelectExecuteHandler";
import {IFuzzinessIntensity} from "../_types/IFuzzinessIntensity";

/**
 * Creates a menu item to select the search fuzziness
 * @returns The menu item field that can be used as setting
 */
export function createFuzzinessSetting() {
    return createFieldMenuItem<IFuzzinessIntensity>({
        init: "medium",
        data: field => ({
            name: "Fuzziness",
            description: "",
            valueView: <Loader>{h => field.get(h)}</Loader>,
            tags: ["field"],
            resetUndoable: true,
            actionBindings: [
                promptSelectExecuteHandler.createBinding({
                    subscribableData: h => ({
                        field,
                        options: ["none", "minimal", "medium", "strong", "super strong"],
                        createOptionView: (fuzziness: IFuzzinessIntensity) =>
                            createStandardMenuItem({name: fuzziness}),
                    }),
                }),
            ],
        }),
    });
}
