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
import {globalKeyHandler} from "../../../../keyHandler/globalKeyHandler/globalKeyHandler";
import {ITriggerablePatternMenuItem} from "./_types/ITriggerableKeyPatternMenuItem";

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
    ...rest
}: IKeyPatternMenuItemData): ITriggerablePatternMenuItem {
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
            listeners.push(callback);

            // Register the shortcut listener and listen for setting changes to update it when needed
            if (listeners.length == 1) {
                const updatePattern = () => {
                    removeInvoker?.();
                    removeInvoker = globalKeyHandler.addShortcut(field.get(), () =>
                        listeners.forEach(listener => listener())
                    );
                };
                observer = new Observer(h => field.get(h)).listen(updatePattern);
                updatePattern();
            }

            // Return the
            return () => {
                const index = listeners.indexOf(callback);
                if (index != -1) {
                    listeners.slice(index, 1);

                    // Dispose the listeners if this was the last one
                    if (listeners.length == 0) {
                        observer?.destroy();
                        removeInvoker?.();
                    }
                }
            };
        },
    };
}
