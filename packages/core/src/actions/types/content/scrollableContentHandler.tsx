import React from "react";
import {IViewStackItemView} from "../../../uiLayers/_types/IViewStackItem";
import {IIdentifiedItem} from "../../../_types/IIdentifiedItem";
import {createAction, createStandardBinding} from "../../createAction";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IBindingCreatorConfig} from "../../_types/IBindingCreator";
import {getContentAction} from "./getContentAction";
import {v4 as uuid} from "uuid";
import {adjustBindingInput} from "../../utils/adjustBindingInput";
import {Content} from "../../../content/Content";
import {createContentKeyHandler} from "../../../content/interaction/keyHandler/createContentKeyHandler";
import {IUUID} from "../../../_types/IUUID";
import {ContentView} from "../../../components/content/ContentView";

/**
 * A handler that attaches scrollable content to items
 */
export const scrollableContentHandler = createAction({
    name: "scrollable content handler",
    parents: [getContentAction],
    core: (contents: IIdentifiedItem<IViewStackItemView>[]) => ({
        result: contents,
        children: contents.map(item =>
            getContentAction.createBinding(context => {
                const content = new Content(item.value);
                const handler = createContentKeyHandler(content, context);
                const view = <ContentView content={content} />;
                return {content, contentView: view, contentHandler: handler};
            }, item.ID)
        ),
    }),

    /**
     * Creates a new action binding and generates an ID for this item identity
     * @param config The data for the binding, and optionally extra configuration
     * @param ID The ID for this item
     * @returns The created binding with the identity key
     */
    createBinding: function (
        config: IViewStackItemView | IBindingCreatorConfig<IViewStackItemView>,
        ID: IUUID = uuid()
    ): IActionBinding<
        IAction<
            IIdentifiedItem<IViewStackItemView>,
            IIdentifiedItem<IViewStackItemView>[]
        >
    > {
        return createStandardBinding.call(
            this,
            adjustBindingInput(config, data => ({ID, value: data}))
        );
    },
});
