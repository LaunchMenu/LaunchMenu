import {IAction} from "../_types/IAction";
import {IActionHandlerCore} from "../_types/IActionHandlerCore";
import {createActionHandler} from "../createActionHandler";
import {IMenuItem} from "../../items/_types/IMenuItem";
import {IActionHandler} from "../_types/IActionHandler";

const createItem = (data: string, handler: IActionHandler<any, any, any>): IMenuItem => ({
    view: null as any,
    actionBindings: [
        {
            handler: handler,
            data,
            tags: [],
        },
    ],
});

describe("createActionHandler", () => {
    const action: IAction<number, any> = null as any;
    const actionHandlerCore: IActionHandlerCore<string, number> = bindings =>
        bindings.reduce((c, s) => c + s.length, 0);

    it("Properly creates an action handler", () => {
        const handler = createActionHandler(action, actionHandlerCore, []);
        expect(handler).toHaveProperty("get");
        expect(handler).toHaveProperty("createBinding");
    });

    describe("handler.get", () => {
        it("Properly gets the result for binding data", () => {
            const handler = createActionHandler(action, actionHandlerCore, []);
            const length = handler.get(["oranges", "stuff"]);
            expect(length).toBe(7 + 5);
        });
        it("Properly gets the result for menu items", () => {
            const handler = createActionHandler(action, actionHandlerCore, []);
            const items = [createItem("oranges", handler), createItem("stuff", handler)];
            const length = handler.get(items);
            expect(length).toBe(7 + 5);
        });
        it("Ignores bindings for other handlers", () => {
            const handler = createActionHandler(action, actionHandlerCore, []);
            const handler2 = createActionHandler(action, () => Infinity, []);
            const items = [
                createItem("oranges", handler),
                createItem("potatoes", handler2), // Should be ignored
                createItem("stuff", handler),
            ];
            const length = handler.get(items);
            expect(length).toBe(7 + 5);
        });
    });

    describe("handler.createBinding", () => {
        it("Properly creates bindings", () => {
            const handler = createActionHandler(action, actionHandlerCore, []);
            const binding = handler.createBinding("poops", ["potato"]);
            expect(binding).toHaveProperty("handler", handler);
            expect(binding).toHaveProperty("data", "poops");
            expect(binding).toHaveProperty("tags", ["potato"]);
        });
        it("Inherits tags", () => {
            const handler = createActionHandler(action, actionHandlerCore, ["oranges"]);
            const binding = handler.createBinding("poops");
            expect(binding).toHaveProperty("tags", ["oranges"]);

            const binding2 = handler.createBinding("poops", tags => [...tags, "potato"]);
            expect(binding2).toHaveProperty("tags", ["oranges", "potato"]);
        });
    });
});
