import {IRenderableSettingsTree} from "../_types/IRenderableSettingsTree";
import {TSettingsTree} from "../_types/TSettingsTree";
import {ExtendedObject} from "../../utils/ExtendedObject";
import {IJSONDeserializer} from "../_types/serialization/IJSONDeserializer";

/**
 * Flattens the renderable settings structure in order to only be left with the settings themselves
 * @param renderableSettings The renderable settings to extract the settings from
 * @returns The settings tree
 */
export function extractSettings<
    T extends IRenderableSettingsTree<IJSONDeserializer>
>(renderableSettings: {children: T}): TSettingsTree<T> {
    return ExtendedObject.map(renderableSettings.children as IRenderableSettingsTree, v =>
        "children" in v ? extractSettings(v) : v
    ) as TSettingsTree<T>;
}
