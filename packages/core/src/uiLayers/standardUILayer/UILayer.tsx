import React from "react";
import {Field, IDataHook} from "model-react";
import {IUILayerData} from "./_types/IUILayerData";
import {
    IStandardUILayerData,
    IStandardUILayerDataObject,
} from "./_types/IStandardUILayerData";
import {v4 as uuid} from "uuid";
import {MenuView} from "../../components/menu/MenuView";
import {createMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {TextFieldView} from "../../components/fields/TextFieldView";
import {createTextFieldKeyHandler} from "../../textFields/interaction/keyHandler/createTextFieldKeyHandler";
import {IIOContext} from "../../context/_types/IIOContext";
import {UnifiedAbstractUILayer} from "./UnifiedAbstractUILayer";
import {MenuSearch} from "../types/menuSearch/MenuSearch";
import {mergeCallbacks} from "../../utils/mergeCallbacks";
import {ContentView} from "../../components/content/ContentView";
import {createContentKeyHandler} from "../../content/interaction/keyHandler/createContentKeyHandler";
import {IUILayerBaseConfig} from "../_types/IUILayerBaseConfig";

/**
 * The default UILayer class
 */
export class UILayer extends UnifiedAbstractUILayer {
    protected inputData: IStandardUILayerData[];
    protected data = new Field([] as IUILayerData[]);

    /**
     * Creates a new standard UILayer
     * @param data The data to create the layer from
     * @param config Base ui layer configuration
     */
    public constructor(
        data: IStandardUILayerData[] | IStandardUILayerData,
        config?: IUILayerBaseConfig
    ) {
        super(config);
        if (!(data instanceof Array)) data = [data];
        this.inputData = data;
    }

    /** @override */
    protected initialize(
        context: IIOContext,
        close: () => void
    ): void | (() => Promise<void>) {
        if (this.data.get(null).length == 0) {
            this.data.set(
                this.inputData.flatMap(item =>
                    this.processLayerItem(item, context, close)
                )
            );

            return async () => {
                await Promise.all(
                    this.data
                        .get(null)
                        .map(data => ("onClose" in data ? data.onClose?.() : undefined))
                );
                this.data.set([]);
            };
        }
    }

    /**
     * Processes the layer data
     * @param data The layer data to be processed
     * @param context The context that can be used by
     * @param close A function that closes this layer in the specified context
     * @returns The processed data
     */
    protected processLayerItem(
        data: IStandardUILayerData,
        context: IIOContext,
        close: () => void
    ): IUILayerData[] {
        // Return the data if it's a UILayer
        if ("getKeyHandlers" in data) return [data];
        if (data instanceof Function) data = data(context, close);

        const ID = uuid();
        let res = {ID} as IStandardUILayerDataObject & {onClose?: () => void};
        let extra: IUILayerData[] = [];

        let empty = true;

        // Create the standard menu data
        if (data.menu) {
            const menu = data.menu;
            if (data.destroyOnClose != false)
                res.onClose = mergeCallbacks([res.onClose, () => menu.destroy()]);
            const menuLayerData = {
                ID,
                menu,
                menuView: data.menuView ?? (
                    <MenuView menu={data.menu} onExecute={data.onExecute} />
                ),
                menuHandler:
                    data.menuHandler ??
                    createMenuKeyHandler(data.menu, {
                        onExit: close,
                        onExecute: data.onExecute,
                    }),
            };

            // If a search menu is requested, add it as an extra layer, otherwise just add the menu
            if (data.searchable !== false) {
                extra.push(
                    new MenuSearch({
                        menu: data.menu,
                        defaultMenu: menuLayerData,
                        onExecute: data.onExecute,
                    })
                );
            } else {
                empty = false;
                res = {
                    ...menuLayerData,
                    ...res,
                };
            }
        }

        // Create the standard field data
        if (data.field) {
            empty = false;
            const {field} = data;
            res = {
                field,
                fieldView: data.fieldView ?? (
                    <TextFieldView
                        field={field}
                        highlighter={data.highlighter}
                        icon={data.icon}
                    />
                ),
                fieldHandler:
                    data.fieldHandler ?? createTextFieldKeyHandler(field, context),
                ...res,
            };
        }

        // Create the content data
        if (data.content) {
            empty = false;
            const {content} = data;
            res = {
                content,
                contentView: data.contentView ?? <ContentView content={content} />,
                contentHandler:
                    data.contentHandler ?? createContentKeyHandler(content, context),
                ...res,
            };
        }

        // Check for only a key handler
        if (data.contentHandler && empty) {
            empty = false;
            res = {
                contentView: undefined,
                ...res,
            };
        }

        // Return the data
        return empty ? extra : [res as IUILayerData, ...extra];
    }

    /** @override */
    public getAll(hook: IDataHook = null): IUILayerData[] {
        return this.data.get(hook);
    }
}
