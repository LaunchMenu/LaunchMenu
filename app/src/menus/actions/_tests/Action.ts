import {Action} from "../Action";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";
import {IMenuItem} from "../../items/_types/IMenuItem";

const createItem = (...bindings: IActionBinding<any>[]): IMenuItem => ({
    view: null as any,
    actionBindings: bindings,
});

describe("Action", () => {
    describe("new Action", () => {
        // Notice that these action cores are only for testing and don't make any sense
        it("Doesn't error", () => {
            new Action((input: number[]) => {
                return 3;
            });
        });
        it("Can be a handler for another action", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = new Action(
                (input: number[]) => {
                    return 3;
                },
                [],
                action
            );
            expect(handler.ancestors.length).toEqual(1);
            expect(handler.ancestors[0]).toEqual(action);
        });
    });
    describe("Action.createBinding", () => {
        // Notice that these action cores are only for testing and don't make any sense
        it("Creates a binding to this action", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const binding = action.createBinding(2);
            expect(binding.action).toEqual(action);
            expect(binding.data).toEqual(2);
            expect(binding.tags).toEqual([]);

            const binding2 = action.createBinding(12, ["hoi", "hi"]);
            expect(binding2.action).toEqual(action);
            expect(binding2.data).toEqual(12);
            expect(binding2.tags).toEqual(["hoi", "hi"]);
        });
        it("Inherits bindings from the action", () => {
            const action = new Action(
                (input: number[]) => {
                    return 3;
                },
                ["potatoes"]
            );
            const binding = action.createBinding(2);
            expect(binding.tags).toEqual(["potatoes"]);

            const binding2 = action.createBinding(2, ["oranges"]);
            expect(binding2.tags).toEqual(["oranges"]);

            const binding3 = action.createBinding(2, tags => [...tags, "oranges"]);
            expect(binding3.tags).toEqual(["potatoes", "oranges"]);
        });
    });
    describe("Action.createHandler", () => {
        // Notice that these action cores are only for testing and don't make any sense
        it("Creates an action with this action as ancestor", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = action.createHandler((input: boolean[]) => {
                return 2;
            });
            expect(handler.ancestors).toEqual([action]);
        });
        it("Inherits default tags", () => {
            const action = new Action(
                (input: number[]) => {
                    return 3;
                },
                ["stuff"]
            );
            const handler = action.createHandler((input: boolean[]) => {
                return 2;
            });
            expect(handler.createBinding(true).tags).toEqual(["stuff"]);

            const handler2 = action.createHandler(
                (input: boolean[]) => {
                    return 2;
                },
                tags => [...tags, "oranges"]
            );
            expect(handler2.createBinding(true).tags).toEqual(["stuff", "oranges"]);
        });
        it("Can create handlers for handlers", () => {
            const action = new Action((input: number[]) => {
                return 3;
            });
            const handler = action.createHandler((input: boolean[]) => {
                return 2;
            });
            const subHandler = handler.createHandler((input: string[]) => {
                return true;
            });
            expect(subHandler.ancestors).toEqual([action, handler]);
        });
    });
    describe("Action.get", () => {
        // Notice that these action cores are a little more realistic, but don't show off the benefits of making handlers
        // Handlers are intended for when data has to be combined in another way than the original action does
        let action: IAction<number, number>;
        beforeEach(() => {
            action = new Action((inputs: number[]) => {
                return inputs.reduce((cur, data) => cur + data, 0);
            });
        });
        it("Correctly calls the core when data is provided", () => {
            expect(action.get([2, 5], [[], []])).toBe(7);
        });
        describe("Correctly calls the actions/handlers of the right items", () => {
            it("Properly works for direct children", () => {
                expect(
                    action.get([
                        createItem(action.createBinding(2)),
                        createItem(action.createBinding(4)),
                    ])
                ).toBe(6);
            });
            it("Doesn't error on empty lists", () => {
                expect(action.get([])).toBe(0);
                expect(action.get([createItem()])).toBe(0);
            });
            it("Properly works for handlers", () => {
                const handler = action.createHandler((inputs: string[]) => {
                    return inputs.reduce((cur, text) => cur + text.length, 0) + 1;
                });
                expect(
                    action.get([
                        createItem(handler.createBinding("yes")),
                        createItem(action.createBinding(2)),
                        createItem(action.createBinding(4)),
                        createItem(handler.createBinding("no")),
                    ])
                ).toBe(12);
            });
            it("Properly works for sub handlers", () => {
                const stringLengthHandler = action.createHandler((inputs: string[]) => {
                    return inputs.reduce((cur, text) => cur + text.length, 0) + 1;
                });
                const boolStringLengthSubHandler = stringLengthHandler.createHandler(
                    (inputs: boolean[]) => {
                        return inputs.reduce((cur, bool) => cur + bool, "yes"); // casts boolean to "true" or "false" and adds all values to one string, starting with "yes"
                    }
                );
                expect(
                    action.get([
                        createItem(stringLengthHandler.createBinding("yes")),
                        createItem(action.createBinding(2)),
                        createItem(boolStringLengthSubHandler.createBinding(false)),
                        createItem(action.createBinding(4)),
                        createItem(stringLengthHandler.createBinding("no")),
                        createItem(boolStringLengthSubHandler.createBinding(true)),
                        createItem(),
                    ])
                ).toBe(24);

                // Even more extensive/elaborate test
                const mulHandler = action.createHandler((inputs: number[]) =>
                    inputs.reduce((cur, data) => cur * data, 1)
                );
                const mul2SubHandler = mulHandler.createHandler((inputs: number[]) =>
                    inputs.reduce((cur, data) => cur + 2 * data, 0)
                );
                const mul3SubHandler = mulHandler.createHandler((inputs: number[]) =>
                    inputs.reduce((cur, data) => cur + 3 * data, 0)
                );
                expect(
                    action.get([
                        createItem(stringLengthHandler.createBinding("yes")),
                        createItem(action.createBinding(2)),
                        createItem(boolStringLengthSubHandler.createBinding(false)),
                        createItem(action.createBinding(4)),
                        createItem(stringLengthHandler.createBinding("no")),
                        createItem(boolStringLengthSubHandler.createBinding(true)),
                        createItem(),
                        // (2 * 2) * (3 * 5)
                        createItem(mul2SubHandler.createBinding(2)),
                        createItem(mul3SubHandler.createBinding(5)),
                    ])
                ).toBe(84);
            });
        });
        it("Correctly works for handlers directly", () => {
            const handler = action.createHandler((inputs: string[]) => {
                return inputs.reduce((cur, text) => cur + text.length, 0) + 1;
            });
            expect(
                handler.get([
                    createItem(handler.createBinding("yes")),
                    createItem(action.createBinding(2)),
                    createItem(action.createBinding(4)),
                    createItem(handler.createBinding("no")),
                ])
            ).toBe(6);
        });
    });
});
