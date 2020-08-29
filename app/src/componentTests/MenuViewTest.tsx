import React, {FC} from "react";
import {Menu} from "../menus/menu/Menu";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createStandardMenuItem} from "../menus/items/createStandardMenuItem";
import {ViewStack} from "../stacks/viewStack/ViewStack";
import {KeyHandlerStack} from "../stacks/keyHandlerStack/KeyHandlerStack";
import {StackView} from "../components/stacks/StackView";
import {Action} from "../menus/actions/Action";
import {IOContext} from "../context/IOContext";
import {Box} from "../styling/box/Box";
import {keyHandlerAction} from "../menus/actions/types/keyHandler/keyHandlerAction";
import {createContextAction} from "../menus/actions/contextAction/createContextAction";
import {UndoRedoFacility} from "../undoRedo/UndoRedoFacility";
import {Field, Loader} from "model-react";
import {Command} from "../undoRedo/Command";
import {createMenuKeyHandler} from "../menus/menu/interaction/keyHandler/createMenuKeyHandler";
import {wait} from "../_tests/wait.helper";
import {getContextMenuItems} from "../menus/utils/getContextMenu";
import {CompoundCommand} from "../undoRedo/commands/CompoundCommand";
import {inputFieldExecuteHandler} from "../textFields/types/inputField/InputFieldExecuteHandler";
import {SetFieldCommand} from "../undoRedo/commands/SetFieldCommand";
import {selectFieldExecuteHandler} from "../textFields/types/selectField/selectFieldExecuteHandler";
import {multiSelectFieldExecuteHandler} from "../textFields/types/multiselectField/multiSelectFieldExecuteHandler";
import {KeyPattern} from "../menus/items/inputs/handlers/keyPattern/KeyPattern";
import {keyInputExecuteHandler} from "../menus/items/inputs/handlers/keyPattern/keyInputExecuteHandler";
import {advancedKeyInputEditAction} from "../menus/items/inputs/handlers/keyPattern/advancedKeyInputEditAction";
import {numberInputExecuteHandler} from "../menus/items/inputs/handlers/number/numberInputExecuteHandler";
import {numberInputSelectExecuteHandler} from "../menus/items/inputs/handlers/number/numberInputSelectExecuteHandler";
import {colorInputExecuteHandler} from "../menus/items/inputs/handlers/color/colorInputExecuteHandler";
import {IContextExecuteData} from "../context/_types/IContextExecuteData";
import {openUI} from "../context/openUI/openUI";
import {createStringMenuItem} from "../menus/items/inputs/types/string/createStringMenuItem";
import {createNumberMenuItem} from "../menus/items/inputs/types/number/createNumberMenuItem";
import {createColorMenuItem} from "../menus/items/inputs/types/color/createColorMenuItem";

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
                        binding => binding.tags.includes(mySubMenu)
                    );

                    const defaultExecuteItem = createStandardMenuItem({
                        name: "Sub Alert",
                        onExecute: () => {
                            alert(text);
                            closeAll();
                        },
                    });

                    closeMenu = openUI(context, {
                        menu: new Menu(context, [defaultExecuteItem, ...subItems]),
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
    [mySubMenu]
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
});
context.panes.content.push(<Box>I am a cool box yo</Box>);

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
        onExecute: () => new SetFieldCmd(someField, "Bob"),
        actionBindings: [alertAction.createBinding({message: "Bob"})],
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
    someField6,
    someField7,
    someField8,
    someField9,
    createStandardMenuItem({
        name: "Undo",
        onExecute: () => undoRedo.undo(),
        actionBindings: [
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (e.is(["ctrl", "z"])) {
                        undoRedo.undo();
                        return true;
                    }
                },
            }),
        ],
    }),
    createStandardMenuItem({
        name: "Redo",
        onExecute: () => undoRedo.redo(),
        actionBindings: [
            keyHandlerAction.createBinding({
                onKey: e => {
                    if (e.is(["ctrl", "y"])) {
                        undoRedo.redo();
                        return true;
                    }
                },
            }),
        ],
    }),
]);
context.openUI({
    menu,
    menuHandler: createMenuKeyHandler(menu),
});

(window as any).alertAction = alertAction;
(window as any).alertHandlerAction = alertHandlerAction;
(window as any).createStandardMenuItem = createStandardMenuItem;
console.log(contentViewStack);

export const MenuViewTest: FC = () => {
    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box height={30}>
                <Loader>{h => someField.get(h)}</Loader>{" "}
                <Loader>{h => someField2.get(h).toString()}</Loader>{" "}
                <Loader>{h => someField6.get(h)}</Loader>{" "}
                <Loader>{h => undoRedo.getState(h)}</Loader>
            </Box>
            <Box position="relative" height={80}>
                <StackView stack={fieldViewStack} />
            </Box>
            <Box flexGrow={1} display="flex">
                <Box position="relative" width={300}>
                    <StackView stack={menuViewStack} />
                </Box>
                <Box position="relative" flexGrow={1}>
                    <StackView stack={contentViewStack} />
                </Box>
            </Box>
        </Box>
    );
};
