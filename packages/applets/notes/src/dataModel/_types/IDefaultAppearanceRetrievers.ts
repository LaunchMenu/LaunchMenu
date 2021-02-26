import {IDataRetriever} from "model-react";
import {INoteAppearanceMetadata} from "./INoteAppearanceMetadata";

/** The retrievers for the defaults of the appearance */
export type IDefaultAppearanceRetrievers = {
    [K in keyof INoteAppearanceMetadata]: IDataRetriever<INoteAppearanceMetadata[K]>;
};
