import React from "react";
import {Field, IDataHook} from "model-react";
import {IUILayerData} from "./_types/IUILayerData";
import {
    IStandardUILayerData,
    IStandardUILayerDataObject,
} from "./_types/IStandardUILayerData";
import {v4 as uuid} from "uuid";
import {MenuView} from "../../components/menu/MenuView";
import {createStandardMenuKeyHandler} from "../../menus/menu/interaction/keyHandler/createStandardMenuKeyHandler";
import {TextFieldView} from "../../components/fields/TextFieldView";
import {createStandardTextFieldKeyHandler} from "../../textFields/interaction/keyHandler/createStandardTextFieldKeyHandler";
import {IIOContext} from "../../context/_types/IIOContext";
import {UnifiedAbstractUILayer} from "./UnifiedAbstractUILayer";
import {MenuSearch} from "../types/menuSearch/MenuSearch";
import {mergeCallbacks} from "../../utils/mergeCallbacks";
import {ContentView} from "../../components/content/ContentView";
import {createStandardContentKeyHandler} from "../../content/interaction/keyHandler/createStandardContentKeyHandler";
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
        if (this.data.get().length == 0) {
            this.data.set(
                this.inputData.flatMap(item =>
                    this.processLayerItem(item, context, close)
                )
            );

            return async () => {
                await Promise.all(
                    this.data
                        .get()
                        .map(data => ("onClose" in data ? data.onClose?.() : undefined))
                );
                this.data.set([]);
            };
        }
    }

    /**
     * Processes the layer data
     * @param inpData The layer data to be processed
     * @param context The context that can be used by
     * @param close A function that closes this layer in the specified context
     * @returns The processed data
     */
    protected processLayerItem(
        inpData: IStandardUILayerData,
        context: IIOContext,
        close: () => void
    ): IUILayerData[] {
        // Return the data if it's a UILayer
        if ("getKeyHandlers" in inpData) return [inpData];

        const data: IStandardUILayerDataObject & {onClose?: () => void} =
            inpData instanceof Function ? inpData(context, close) : inpData;

        const ID = uuid();
        let res = {
            ID,
            onClose: data.onClose,
            overlayGroup: data.overlayGroup,
        } as IStandardUILayerDataObject & {
            onClose?: () => void;
        };
        let extra: IUILayerData[] = [];

        let empty = !data.onClose;

        // Create the standard menu data
        if (data.menu) {
            const menu = data.menu;
            if (data.destroyOnClose != false)
                res.onClose = mergeCallbacks([res.onClose, () => menu.destroy()]);

            // Create a key handler if not present
            let menuHandler = data.menuHandler;
            if (!menuHandler) {
                const disposableHandler = createStandardMenuKeyHandler(data.menu, {
                    onExit: data.handleClose === false ? undefined : close,
                    onExecute: data.onExecute,
                });
                menuHandler = disposableHandler.handler;
                res.onClose = mergeCallbacks([res.onClose, disposableHandler.destroy]);
            }

            // Combine all the menu data
            const menuLayerData = {
                ID,
                menu,
                menuView: data.menuView ?? (
                    <MenuView menu={data.menu} onExecute={data.onExecute} />
                ),
                menuHandler,
            };

            // If a search menu is requested, add it as an extra layer, otherwise just add the menu
            if (data.searchable !== false) {
                extra.push(
                    new MenuSearch({
                        menu: data.menu,
                        defaultMenu: menuLayerData,
                        onExecute: data.onExecute,
                        icon: data.icon,
                    })
                );
            } else {
                empty = false;
                res = {
                    ...menuLayerData,
                    ...res,
                };
            }
        } else if (data.menuView) {
            empty = false;
            res = {
                menuView: data.menuView,
                menuHandler: data.menuHandler,
                ...res,
            };
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
                    data.fieldHandler ??
                    createStandardTextFieldKeyHandler(field, context, {
                        onExit: !res.menuHandler && data.handleClose ? close : undefined,
                    }),
                ...res,
            };
        } else if (data.fieldView) {
            empty = false;
            res = {
                fieldView: data.fieldView,
                fieldHandler: data.fieldHandler,
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
                    data.contentHandler ??
                    createStandardContentKeyHandler(content, context, {
                        onExit:
                            !res.menuHandler && !res.fieldHandler && data.handleClose
                                ? close
                                : undefined,
                    }),
                ...res,
            };
        } else if (data.contentView) {
            empty = false;
            res = {
                contentView: data.contentView,
                contentHandler: data.contentHandler,
                ...res,
            };
        }

        // Check for only a key handler
        if (data.contentHandler && empty) {
            empty = false;
            res = {
                contentView: undefined,
                contentHandler: data.contentHandler,
                ...res,
            };
        }

        // Return the data
        return empty ? extra : [res as IUILayerData, ...extra];
    }

    /** @override */
    public getAll(hook?: IDataHook): IUILayerData[] {
        return this.data.get(hook);
    }
}
