import {IRenderableSettingsTree} from "./IRenderableSettingsTree";
import {IField} from "../../_types/IField";

/**
 * Extracts a simple settings tree from a renderable settings tree, by removing the category nodes
 */
export type TSettingsTree<T extends IRenderableSettingsTree> = {
    [P in keyof T]: T[P] extends {children: IRenderableSettingsTree}
        ? TSettingsTree<T[P]["children"]>
        : T[P] extends IField<infer I>
        ? IField<I>
        : T[P];
};
