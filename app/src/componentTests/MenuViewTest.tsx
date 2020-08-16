import React, {FC} from "react";
import {Menu} from "../menus/menu/Menu";
import {KeyHandler} from "../stacks/keyHandlerStack/KeyHandler";
import {createStandardMenuItem} from "../menus/items/createStandardMenuItem";
import {ViewStack} from "../stacks/ViewStack";
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

const someField = new Field("oranges");
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
const alertHandlerAction = alertAction.createHandler(
    createContextAction(
        (data: {message: string}[]) => {
            const text = "(" + data.map(({message}) => message).join(",") + ")";
            return {
                message: text,
                execute: () => alert(text),
            };
        },
        {name: "Sub Alert", shortcut: ["ctrl", "q"]}
    )
);

// Create stacks and some menu
const menuViewStack = new ViewStack();
const fieldViewStack = new ViewStack();
const inputStack = new KeyHandlerStack(new KeyHandler(window));
const menu = new Menu([
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
        onExecute: () => new SetFieldCmd(someField, "Poof"),
        actionBindings: [alertHandlerAction.createBinding({message: "Poof"})],
    }),
    createStandardMenuItem({
        name: "Wow",
        onExecute: () => new SetFieldCmd(someField, "Wow"),
    }),
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
const undoRedo = new UndoRedoFacility();

const context = new IOContext({
    panes: {menu: menuViewStack, content: menuViewStack, field: fieldViewStack},
    keyHandler: inputStack,
    undoRedo,
});
context.openUI({
    menu,
    menuHandler: createMenuKeyHandler(menu, context),
});

(window as any).alertAction = alertAction;
(window as any).alertHandlerAction = alertHandlerAction;
(window as any).createStandardMenuItem = createStandardMenuItem;

export const MenuViewTest: FC = () => {
    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box height={30}>
                <Loader>{h => someField.get(h)}</Loader>{" "}
                <Loader>{h => undoRedo.getState(h)}</Loader>
            </Box>
            <Box position="relative" height={80}>
                <StackView items={fieldViewStack} />
            </Box>
            <Box position="relative" flexGrow={1}>
                <StackView items={menuViewStack} />
            </Box>
        </Box>
    );
};
