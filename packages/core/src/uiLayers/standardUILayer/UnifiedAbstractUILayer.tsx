import {IDataHook} from "model-react";
import {IKeyEventListener} from "../../keyHandler/_types/IKeyEventListener";
import {IUILayer} from "../_types/IUILayer";
import {IUILayerContentData} from "../_types/IUILayerContentData";
import {IUILayerData} from "./_types/IUILayerData";
import {IUILayerFieldData} from "../_types/IUILayerFieldData";
import {IUILayerMenuData} from "../_types/IUILayerMenuData";
import {AbstractUILayer} from "../AbstractUILayer";
import {IIOContext} from "../../context/_types/IIOContext";

/**
 * An abstract class that can be used as a foundation for a UILayer, where all ui components can be passed together
 */
export abstract class UnifiedAbstractUILayer extends AbstractUILayer implements IUILayer {
    /** @override */
    public async onOpen(
        context: IIOContext,
        close: () => void
    ): Promise<() => Promise<void>> {
        // Call the regular onOpen which will call an initializer
        const onClose = await super.onOpen(context, close);

        // Open a child layers and keep their onClose callbacks
        const childOnClose = await Promise.all(
            this.getAll()
                .filter((item): item is IUILayer => "onOpen" in item)
                .map(item => item.onOpen(context, close))
        );

        // Call close on the child layers and teh regular initializer
        return async () => {
            await Promise.all(childOnClose.map(onClose => (onClose ? onClose() : null)));
            await onClose?.();
        };
    }

    /**
     * Retrieves all of the UIData and their precedence order (later = higher)
     * @param hook The data hook to subscribe to changes
     * @returns ALl the UI elements
     */
    public abstract getAll(hook?: IDataHook): IUILayerData[];

    // TODO: add a system to not call the hook if nothing changed for a given stack (menu/field/content)
    /**
     * Retrieves the menu data
     * @param hook The data hook to subscribe to changes
     * @returns The menu data of this layer
     */
    public getMenuData(hook?: IDataHook): IUILayerMenuData[] {
        const menus = this.getAll(hook)
            .flatMap((item): IUILayerData[] =>
                "getMenuData" in item ? item.getMenuData(hook) : [item]
            )
            .filter((el): el is IUILayerMenuData => "menuView" in el);
        return super.getMenuData(hook, menus);
    }

    /**
     * Retrieves the field data
     * @param hook The data hook to subscribe to changes
     * @returns The field data of this layer
     */
    public getFieldData(hook?: IDataHook): IUILayerFieldData[] {
        const fields = this.getAll(hook)
            .flatMap((item): IUILayerData[] =>
                "getFieldData" in item ? item.getFieldData(hook) : [item]
            )
            .filter((el): el is IUILayerFieldData => "fieldView" in el);
        return super.getFieldData(hook, fields);
    }

    /**
     * Retrieves the content data
     * @param hook The data hook to subscribe to changes
     * @returns The content data of this layer
     */
    public getContentData(hook: IDataHook = null): IUILayerContentData[] {
        const content = this.getAll(hook)
            .flatMap((item): IUILayerData[] =>
                "getContentData" in item ? item.getContentData(hook) : [item]
            )
            .filter(
                (el): el is IUILayerContentData =>
                    "contentView" in el && el.contentView !== undefined
            );
        return super.getContentData(hook, content);
    }

    /**
     * Retrieves the key listener data
     * @param hook The data hook to subscribe to changes
     * @returns The key listener data of this layer
     */
    public getKeyHandlers(hook?: IDataHook): IKeyEventListener[] {
        return this.getAll(hook).flatMap(el =>
            "getKeyHandlers" in el
                ? el.getKeyHandlers(hook)
                : ([
                      (el as IUILayerMenuData).menuHandler,
                      (el as IUILayerFieldData).fieldHandler,
                      (el as IUILayerContentData).contentHandler,
                  ].filter(Boolean) as IKeyEventListener[])
        );
    }
}
