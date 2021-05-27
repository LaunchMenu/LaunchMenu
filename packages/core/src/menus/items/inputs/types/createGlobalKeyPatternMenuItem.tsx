import React from "react";
import {createFieldMenuItem} from "../createFieldMenuItem";
import {Field, IDataHook, Loader, Observer} from "model-react";
import {IKeyPatternMenuItemData} from "./_types/IKeyPatternMenuItemData";
import {KeyPattern} from "../../../../keyHandler/KeyPattern";
import {promptKeyInputExecuteHandler} from "../handlers/keyPattern/promptKeyInputExecuteHandler";
import {advancedKeyInputEditAction} from "../handlers/keyPattern/advancedKeyInputEditAction";
import {adjustSubscribable} from "../../../../utils/subscribables/adjustSubscribable";
import {IKeyArrayPatternData} from "../handlers/keyPattern/_types/IKeyPatternData";
import {ShortcutLabel} from "../../../../components/items/ShortcutLabel";
import {ITriggerablePatternMenuItem} from "./_types/ITriggerableKeyPatternMenuItem";
import {ISettingConfigurer} from "../../../../settings/_types/ISettingConfigurer";
import {LaunchMenu} from "../../../../application/LaunchMenu";
import {v4 as uuid} from "uuid";

/**
 * Creates a new global key pattern menu item, which can listens to key events even when LM isn't focused
 * @param data The configuration data of the field
 * @returns The menu item
 */
export function createGlobalKeyPatternMenuItem({
    init,
    name,
    liveUpdate,
    undoable,
    actionBindings = [],
    tags = [],
    resetUndoable = undoable,
    keyHandler,
    ...rest
}: IKeyPatternMenuItemData): ITriggerablePatternMenuItem & ISettingConfigurer {
    // Pattern data maintenance
    const field = new Field(init);
    const serializableField = {
        get: (h: IDataHook) => field.get(h),
        set: (value: KeyPattern) => field.set(value),
        getSerialized: (h: IDataHook) => field.get(h).serialize(),
        setSerialized: (value: IKeyArrayPatternData[]) =>
            field.set(new KeyPattern(value)),
    };

    // Shortcut trigger maintenance
    const listeners: (() => void)[] = [];
    let observer: undefined | Observer<KeyPattern>;
    let removeInvoker: (() => void) | undefined;
    const id = uuid();

    // Create and return the item
    return {
        ...createFieldMenuItem({
            field: serializableField,
            data: field => ({
                name,
                valueView: (
                    <Loader>
                        {h => <ShortcutLabel shortcut={field.get(h)} explicitEmpty />}
                    </Loader>
                ),
                tags: adjustSubscribable(tags, (tags, h) => [
                    "field",
                    ...tags,
                    field.get(h).toString(),
                ]),
                resetUndoable,
                actionBindings: adjustSubscribable(actionBindings, bindings => [
                    ...bindings,
                    promptKeyInputExecuteHandler.createBinding({
                        field,
                        liveUpdate: liveUpdate as any,
                        undoable,
                        globalShortcut: true,
                    }),
                    advancedKeyInputEditAction.createBinding({
                        field,
                        liveUpdate: liveUpdate as any,
                        undoable,
                        globalShortcut: true,
                    }),
                ]),
                ...rest,
            }),
        }),
        // Add a method to register shortcut handlers
        onTrigger: (callback: () => void) => {
            if (!keyHandler)
                throw new Error(
                    `"onTrigger" can not be used if no key handler is provided`
                );
            const kh = keyHandler;

            listeners.push(callback);

            // Register the shortcut listener and listen for setting changes to update it when needed
            if (listeners.length == 1) {
                const updatePattern = () => {
                    removeInvoker?.();
                    removeInvoker = kh.addShortcut(field.get(), () =>
                        listeners.forEach(listener => listener())
                    );
                };
                observer = new Observer(h => field.get(h)).listen(updatePattern);
                updatePattern();
            }

            // Return the remove callback
            return () => {
                const index = listeners.indexOf(callback);
                if (index != -1) {
                    listeners.splice(index, 1);

                    // Dispose the listeners if this was the last one
                    if (listeners.length == 0) {
                        observer?.destroy();
                        removeInvoker?.();
                    }
                }
            };
        },
        // Allow configuration of the absolute base path
        configure: (data: {[LMConfigurationSymbol]?: LaunchMenu}) => {
            const LM = data[LMConfigurationSymbol];
            if (!keyHandler && LM) keyHandler = LM.getGlobalKeyHandler();
        },
    };
}

/** The symbol that LM for field configuration is stored under */
export const LMConfigurationSymbol = Symbol("LM");
