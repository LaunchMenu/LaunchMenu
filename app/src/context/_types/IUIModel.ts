import {IDataHook} from "model-react";

export type IUIModel = {
    /** Method to indicate that a view for this model was opened */
    addViewCount(): void;
    /** Method to indicate that a view for this model was closed */
    removeViewCount(): void;
    /** Method to retrieve how many views are currently opened */
    getViewCount(hook?: IDataHook): number;
    /** A method to completely get rid of the model and any hooks */
    destroy();
};
