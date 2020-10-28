import React, {FC} from "react";
import {Menu} from "../../src/menus/menu/Menu";
import {KeyHandler} from "../../src/stacks/keyHandlerStack/KeyHandler";
import {createStandardMenuItem} from "../../src/menus/items/createStandardMenuItem";
import {ViewStack} from "../../src/stacks/viewStack/ViewStack";
import {KeyHandlerStack} from "../../src/stacks/keyHandlerStack/KeyHandlerStack";
import {StackView} from "../../src/components/stacks/StackView";
import {Action} from "../../src/menus/actions/Action";
import {IOContext} from "../../src/context/IOContext";
import {Box} from "../../src/styling/box/Box";
import {keyHandlerAction} from "../../src/menus/actions/types/keyHandler/keyHandlerAction";
import {createContextAction} from "../../src/menus/actions/contextAction/createContextAction";
import {UndoRedoFacility} from "../../src/undoRedo/UndoRedoFacility";
import {Field, Loader} from "model-react";
import {Command} from "../../src/undoRedo/Command";
import {createMenuKeyHandler} from "../../src/menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {wait} from "../../src/_tests/wait.helper";
import {getContextMenuItems} from "../../src/menus/contextMenu/getContextMenuItems";
import {CompoundCommand} from "../../src/undoRedo/commands/CompoundCommand";
import {inputFieldExecuteHandler} from "../../src/textFields/types/inputField/InputFieldExecuteHandler";
import {SetFieldCommand} from "../../src/undoRedo/commands/SetFieldCommand";
import {selectFieldExecuteHandler} from "../../src/textFields/types/selectField/selectFieldExecuteHandler";
import {multiSelectFieldExecuteHandler} from "../../src/textFields/types/multiselectField/multiSelectFieldExecuteHandler";
import {KeyPattern} from "../../src/menus/items/inputs/handlers/keyPattern/KeyPattern";
import {keyInputExecuteHandler} from "../../src/menus/items/inputs/handlers/keyPattern/keyInputExecuteHandler";
import {advancedKeyInputEditAction} from "../../src/menus/items/inputs/handlers/keyPattern/advancedKeyInputEditAction";
import {numberInputExecuteHandler} from "../../src/menus/items/inputs/handlers/number/numberInputExecuteHandler";
import {numberInputSelectExecuteHandler} from "../../src/menus/items/inputs/handlers/number/numberInputSelectExecuteHandler";
import {colorInputExecuteHandler} from "../../src/menus/items/inputs/handlers/color/colorInputExecuteHandler";
import {IContextExecuteData} from "../../src/context/_types/IContextExecuteData";
import {openUI} from "../../src/context/openUI/openUI";
import {createStringMenuItem} from "../../src/menus/items/inputs/types/createStringMenuItem";
import {createNumberMenuItem} from "../../src/menus/items/inputs/types/createNumberMenuItem";
import {createColorMenuItem} from "../../src/menus/items/inputs/types/createColorMenuItem";
import {createFolderMenuItem} from "../../src/menus/items/createFolderMenuItem";
import {createSettingsFolder} from "../../src/settings/inputs/createSettingsFolder";
import {createNumberSetting} from "../../src/settings/inputs/createNumberSetting";
import {createStringSetting} from "../../src/settings/inputs/createStringSetting";
import {createColorSetting} from "../../src/settings/inputs/createColorSetting";
import {createBooleanSetting} from "../../src/settings/inputs/createBooleanSetting";
import {createKeyPatternSetting} from "../../src/settings/inputs/createKeyPatternSetting";
import {extractSettings} from "../../src/settings/utils/extractSettings";
import {SettingsContext} from "../../src/settings/SettingsContext";
import {ApplicationLayout} from "../../src/application/components/ApplicationLayout";
import {IViewStack} from "../../src/stacks/viewStack/_types/IViewStack";
import {IViewStackItem} from "../../src/stacks/viewStack/_types/IViewStackItem";
import {MenuView} from "../../src/components/menu/MenuView";
import {PrioritizedMenu} from "../../src/menus/menu/PrioritizedMenu";
import {sortContextCategories} from "../../src/menus/contextMenu/sortContextCategories";
import {prioritizedUndoMenuItem} from "../../src/undoRedo/ui/undoMenuItem";
import {prioritizedRedoMenuItem} from "../../src/undoRedo/ui/redoMenuItem";
import {VersionedFieldsFile} from "../../src/settings/storage/fileTypes/VersionedFieldsFile/VersionFieldsFile";

class PushStackCommand extends Command {
    protected stack: IViewStack;
    protected item: IViewStackItem;

    public metadata = {name: "Add stack item"};
    public constructor(stack: IViewStack, item: IViewStackItem) {
        super();
        this.stack = stack;
        this.item = item;
    }
    protected async onExecute() {
        this.stack.push(this.item);
    }
    protected async onRevert() {
        this.stack.remove(this.item);
    }
}

const someField = new Field("oranges");
const someField2 = new Field("oof");
const someField3 = new Field([45]);
const someField4 = new Field(45);
const someField5 = new Field("orange");
const someField6 = createStringMenuItem({
    init: "bob",
    name: "someField 6",
    undoable: true,
    resetable: true,
});
const someField7 = createNumberMenuItem({
    init: 4,
    name: "someField 7",
    undoable: true,
    resetable: true,
    min: 3,
});
const someField8 = createColorMenuItem({
    init: "orange",
    name: "someField 8",
    undoable: true,
    resetable: true,
});
const someField9 = createStringMenuItem({
    init: "oranges",
    name: "someField 9",
    undoable: true,
    resetable: true,
});
const someFolder = createFolderMenuItem({
    name: "fields",
    children: [someField6, someField7, someField8, someField9],
});
// Programmatic data access
someFolder.children[3].get();

const settingsItem = createSettingsFolder({
    name: "settings",
    children: {
        someNumberSetting: createNumberSetting({name: "potatoes", init: 5}),
        someStringSetting: createStringSetting({name: "oranges", init: "yes"}),
        someColorSetting: createColorSetting({name: "color", init: "orange"}),
        someBooleanSetting: createBooleanSetting({name: "yes", init: true}),
        someSubCategory: createSettingsFolder({
            name: "keyboard",
            children: {
                somePattern: createKeyPatternSetting({
                    name: "pattern",
                    init: new KeyPattern("ctrl+m"),
                }),
            },
        }),
    },
});
const settings = extractSettings(settingsItem);
// settings
console.log("pattern", settings.someSubCategory.somePattern.get());

// new VersionedFieldsFile({
//     version: 1,
//     updater: data => {
//         return data as any;
//     },
//     path: "",
//     fields: settings,
//     deserializers: [KeyPattern],
// });

class SetFieldCmd extends Command {
    protected prev: string | undefined;
    protected text: string;
    protected field: Field<string>;

    public metadata = {name: "set field"};
    public constructor(field: Field<string>, text: string) {
        super();
        this.field = field;
        this.text = text;
    }
    protected async onExecute() {
        this.prev = this.field.get(null);
        await wait(1000);
        this.field.set(this.text);
    }
    protected async onRevert() {
        if (this.prev != undefined) this.field.set(this.prev);
    }
}
const somePatternField = new Field(new KeyPattern([{type: "down", pattern: "ctrl+b"}]));

// Create some context action
const alertAction = new Action(
    createContextAction(
        (data: {message: string}[]) => {
            const text = data.map(({message}) => message).join(",");
            return {execute: () => alert(text)};
        },
        {name: "Alert all"}
    )
);
const mySubMenu = Symbol("my sub menu");
const alertHandlerAction = alertAction.createHandler(
    createContextAction(
        (data: {message: string}[], items) => {
            const text = "(" + data.map(({message}) => message).join(",") + ")";
            return {
                message: text,
                execute: ({context, close: closeParentMenu}: IContextExecuteData) => {
                    let closeMenu = () => {};
                    const closeAll = () => {
                        closeMenu?.();
                        closeParentMenu?.();
                    };

                    const subItems = getContextMenuItems(
                        items.flat(),
                        context,
                        closeAll,
                        null,
                        binding => binding.tags.includes(mySubMenu)
                    );

                    const defaultExecuteItem = {
                        item: createStandardMenuItem({
                            name: "Sub Alert",
                            onExecute: () => {
                                alert(text);
                                closeAll();
                            },
                        }),
                        priority: 1000,
                    };

                    closeMenu = openUI(context, {
                        menu: new PrioritizedMenu(
                            context,
                            [defaultExecuteItem, ...subItems],
                            {sortCategories: sortContextCategories}
                        ),
                    });
                },
            };
        },
        {name: "Sub Alert Menu", shortcut: ["ctrl", "q"], closeOnExecute: false}
    )
);

// Create some actions for in the submenu
const addOneToFieldAction = new Action(
    createContextAction(
        (data: {field: Field<string>}[]) => {
            return {
                execute: () =>
                    new CompoundCommand(
                        {name: "Add one to field"},
                        data.map(
                            ({field}) => new SetFieldCmd(field, field.get(null) + "1")
                        )
                    ),
            };
        },
        {name: "Add one to field"}
    ),
    [mySubMenu, "context"]
);
addOneToFieldAction.get([]).execute();

// Create stacks and some menu
const menuViewStack = new ViewStack();
const fieldViewStack = new ViewStack();
const contentViewStack = new ViewStack();
const inputStack = new KeyHandlerStack(new KeyHandler(window));
const undoRedo = new UndoRedoFacility();
const context = new IOContext({
    panes: {menu: menuViewStack, content: contentViewStack, field: fieldViewStack},
    keyHandler: inputStack,
    undoRedo,
    settings: new SettingsContext(),
    contextMenuItems: [prioritizedUndoMenuItem, prioritizedRedoMenuItem],
});
context.panes.content.push(
    <Box background="bgPrimary" padding="large">
        I am a cool box yo
        <Box>
            1: <Loader>{h => someField.get(h)}</Loader>
        </Box>
        <Box>
            2: <Loader>{h => someField2.get(h)}</Loader>
        </Box>
        <Box>
            3: <Loader>{h => someField3.get(h)}</Loader>
        </Box>
        <Box>
            4: <Loader>{h => someField4.get(h)}</Loader>
        </Box>
        <Box>
            5: <Loader>{h => someField5.get(h)}</Loader>
        </Box>
        <Box>
            6: <Loader>{h => someField6.get(h)}</Loader>
        </Box>
        <Box>
            7: <Loader>{h => someField7.get(h)}</Loader>
        </Box>
        <Box>
            8: <Loader>{h => someField8.get(h)}</Loader>
        </Box>
        <Box>
            9: <Loader>{h => someField9.get(h)}</Loader>
        </Box>
    </Box>
);

const bindingsField = new Field([]);
const menu = new Menu(context);
menu.addItems([
    createStandardMenuItem({
        name: h => `Key Pattern ${somePatternField.get(h || null)}`,
        actionBindings: [
            keyInputExecuteHandler.createBinding({
                field: somePatternField,
                undoable: true,
            }),
            advancedKeyInputEditAction.createBinding({
                field: somePatternField,
                undoable: true,
            }),
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (somePatternField.get(null).matches(e)) {
                        console.log("Event Matched yo");
                        return true;
                    }
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Bob (alert)",
        onExecute: () =>
            new SetFieldCommand(bindingsField, [
                addOneToFieldAction.createBinding({field: someField}),
                keyHandlerAction.createBinding({
                    onKey: e => {
                        if (e.matches(["ctrl", "1"])) {
                            alert("trigger");
                            return true;
                        }
                    },
                }),
            ]),
        actionBindings: h => [
            ...bindingsField.get(h ?? null),
            alertAction.createBinding({message: "Bob"}),
        ],
    }),
    createStandardMenuItem({
        name: "Hank (alert)",
        onExecute: () => new SetFieldCmd(someField, "Hank"),
        actionBindings: [alertAction.createBinding({message: "Hank"})],
    }),
    createStandardMenuItem({
        name: "Woof (alert)",
        onExecute: () => new SetFieldCmd(someField, "Woof"),
        actionBindings: [
            alertAction.createBinding({message: "Woof"}),
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (e.is(["ctrl", "p"])) {
                        console.log("p pressed mofo1");
                        return {
                            stopPropagation: true,
                            stopImmediatePropagation: true,
                        };
                    }
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Oranges (sub alert)",
        onExecute: () => new SetFieldCmd(someField, "Oranges"),
        actionBindings: [
            alertHandlerAction.createBinding({message: "Oranges"}),
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (e.is(["ctrl", "p"])) {
                        console.log("p pressed mofo2");
                        return true;
                    }
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Poof (sub alert)",
        onExecute: () => new SetFieldCommand(someField2, "poop"),
        actionBindings: [
            alertHandlerAction.createBinding({message: "Poof"}),
            addOneToFieldAction.createBinding({field: someField}),
        ],
    }),
    createStandardMenuItem({
        name: "Wow",
        onExecute: () => new SetFieldCommand(someField2, "shit"),
    }),
    createStandardMenuItem({
        name: "Edit field",
        actionBindings: [
            inputFieldExecuteHandler.createBinding({
                field: someField,
                undoable: true,
                config: {
                    checkValidity: text => {
                        if (text[0] == "a")
                            return {
                                message: "Input may not start with A",
                                ranges: [{start: 0, end: 1}],
                            };
                    },
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Edit field 2",
        actionBindings: [
            selectFieldExecuteHandler.createBinding({
                field: someField2,
                undoable: true,
                config: {
                    options: ["shit", "poop"],
                    createOptionView: v => createStandardMenuItem({name: v}),
                    allowCustomInput: true,
                    checkValidity: text => {
                        if (text.length > 4)
                            return {
                                message: "Only strings of at most length 4 are accepted",
                                ranges: [{start: 4, end: text.length}],
                            };
                    },
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Edit field 3",
        actionBindings: [
            multiSelectFieldExecuteHandler.createBinding({
                field: someField3,
                undoable: true,
                config: {
                    options: [25, 50],
                    allowCustomInput: true,
                    checkValidity: text => {
                        if (!/^\d+$/.exec(text)) {
                            const pattern = /[^\d]+/g;
                            let m: RegExpMatchArray | null;
                            const ranges = [] as {start: number; end: number}[];
                            while ((m = pattern.exec(text))) {
                                if (m.index != undefined)
                                    ranges.push({
                                        start: m.index,
                                        end: m.index + m[0].length,
                                    });
                            }
                            return {
                                message: "Value must be an integer",
                                ranges,
                            };
                        }
                    },
                    createOptionView: (value, isSelected) =>
                        createStandardMenuItem({
                            name: h => (isSelected(h) ? "(x) " : "") + value,
                        }),
                    serialize: v => v.toString(),
                    deserialize: v => Number(v),
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Edit field 4",
        actionBindings: [
            numberInputExecuteHandler.createBinding({
                field: someField4,
                min: 3,
                max: 9,
                increment: 0.1,
                baseValue: 0.05,
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Edit field 4 select",
        actionBindings: [
            numberInputSelectExecuteHandler.createBinding({
                field: someField4,
                options: [3, 4, 5],
                allowCustomInput: true,
                min: 0,
                max: 20,
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Edit field 5",
        actionBindings: [
            colorInputExecuteHandler.createBinding({
                field: someField5,
            }),
        ],
    }),
    someFolder,
    settingsItem,
    createStandardMenuItem({
        name: "close menu",
        onExecute: () => new PushStackCommand(menuViewStack, {close: true}),
    }),
    createStandardMenuItem({
        name: "close content",
        onExecute: () => new PushStackCommand(contentViewStack, {close: true}),
    }),
    createStandardMenuItem({
        name: "close field",
        onExecute: () => new PushStackCommand(fieldViewStack, {close: true}),
    }),
    createStandardMenuItem({
        name: "open Menu",
        onExecute: () => new PushStackCommand(menuViewStack, <MenuView menu={menu} />),
    }),
]);
context.openUI({
    menu,
    menuHandler: createMenuKeyHandler(menu),
});

(window as any).context = context;
(window as any).alertAction = alertAction;
(window as any).alertHandlerAction = alertHandlerAction;
(window as any).createStandardMenuItem = createStandardMenuItem;
console.log(contentViewStack);

export const MenuViewTest: FC = () => {
    return (
        <ApplicationLayout
            contentStack={contentViewStack}
            fieldStack={fieldViewStack}
            menuStack={menuViewStack}
        />
    );
};