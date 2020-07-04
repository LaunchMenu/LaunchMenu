import {Action} from "../Action";
import {IActionHandlerItems} from "../_types/IActionHandlerItems";
import {createActionHandler} from "../createActionHandler";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IActionBinding} from "../_types/IActionBinding";

const createItem = (...bindings: IActionBinding<any>[]): IMenuItem => ({
    view: null as any,
    actionBindings: bindings,
});

describe("Action", () => {
    describe("new Action", () => {
        it("Properly creates an action", () => {
            const action = new Action((data: IActionHandlerItems<string>) => ({data}));
            expect(action).toHaveProperty("get");
            expect(action).toHaveProperty("createHandler");
        });
    });
    describe("Action.get", () => {
        const action = new Action((data: IActionHandlerItems<number>) =>
            data.reduce((c, {handler, data}) => c + handler.get(data), 0)
        );
        const handler = createActionHandler(
            action,
            (bindings: string[]) => bindings.reduce((c, s) => c + s.length, 0),
            []
        );

        it("Properly gets the result of items with 1 handler", () => {
            const items = [
                createItem(handler.createBinding("potato")),
                createItem(handler.createBinding("stuff")),
            ];
            const length = action.get(items);
            expect(length).toBe(11);
        });

        it("Properly gets the result of multiple handlers", () => {
            const handler2 = createActionHandler(
                action,
                (
                    bindings: {
                        /** Ts doc will show up when hovering over the item in the binding creation*/
                        number: number;
                    }[]
                ) => bindings.reduce((c, s) => c + s.number, 0),
                []
            );
            const items = [
                createItem(handler.createBinding("potato")),
                createItem(handler.createBinding("stuff")),
                createItem(handler2.createBinding({number: 5})),
                createItem(
                    handler2.createBinding({number: 5}),
                    handler.createBinding("stuff")
                ),
            ];
            const length = action.get(items);
            expect(length).toBe(26);
        });
    });

    describe("Action.createHandler", () => {
        const action = new Action(
            (data: IActionHandlerItems<number>) =>
                data.reduce((c, {handler, data}) => c + handler.get(data), 0),
            ["stuff"]
        );
        it("Properly creates a handler", () => {
            const handler = action.createHandler((bindings: string[]) =>
                bindings.reduce((c, s) => c + s.length, 0)
            );
            expect(handler).toHaveProperty("get");
            expect(handler).toHaveProperty("createBinding");
        });
        it("Properly creates a handler that inherits the default tags", () => {
            const handler = action.createHandler(
                (bindings: string[]) => bindings.reduce((c, s) => c + s.length, 0),
                tags => [...tags, "something"]
            );
            const binding = handler.createBinding("stuff", tags => [...tags, "last"]);
            expect(binding).toHaveProperty("tags", ["stuff", "something", "last"]);
        });
        it("Properly creates a handler that works", () => {
            const handler = action.createHandler((bindings: string[]) =>
                bindings.reduce((c, s) => c + s.length, 0)
            );
            const items = [
                createItem(handler.createBinding("potato")),
                createItem(handler.createBinding("stuff")),
            ];
            const length = action.get(items);
            expect(length).toBe(11);
        });
    });
});
