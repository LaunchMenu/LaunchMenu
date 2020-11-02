import {createAction} from "../createAction";
import {IAction} from "../_types/IAction";
import {IActionBinding} from "../_types/IActionBinding";

describe("createAction", () => {
    it("Shouldn't error", () => {
        const action = createAction({
            name: "My Action",
            core: (data: string[]) => ({result: data.join("-")}),
        });
    });
    describe("createBinding", () => {
        it("Should create a default createBinding method", () => {
            const action = createAction({
                name: "My Action",
                core: (data: string[]) => ({result: data.join("-")}),
            });

            const binding = action.createBinding("yes");
            expect(binding.action).toBe(action);
            expect((binding as any).data).toBe("yes");

            const subscribableBinding = action.createBinding(() => "yes");
            expect(subscribableBinding.action).toBe(action);
            expect((subscribableBinding as any).subscribableData()).toBe("yes");
        });
        it("Should allow the createBinding method to be overridden", () => {
            type IDataType<A> = {a1: A; a2: A};
            const action = createAction({
                name: "My Action",
                core: (data: {a1: any; a2: any}[]) => ({result: data.join("-")}),
                createBinding: function <A>(
                    data: IDataType<A>
                ): IActionBinding<IAction<IDataType<A>, string>> {
                    return {action: this, data};
                },
            });

            const binding = action.createBinding({a1: true, a2: false});
            expect(binding.action).toBe(action);
            expect((binding as any).data).toEqual({a1: true, a2: false});

            // This should result in a compile time type error:
            // const binding2 = action.createBinding({a1: true, a2: "true"});
        });
    });
    describe("get", () => {
        it("Should correctly reduce the result of multiple bindings and handlers", () => {
            /**
             * stringAction <━━ stringActionHandler <━━ stringActionHandlerHandler
             *           ∧
             *           ┕━━━━━━━┓
             * numberAction <━━ stringNumberActionHandler
             */

            const stringAction = createAction({
                name: "StringAction",
                core: (data: string[]) => ({result: data.join("-")}),
            });
            const numberAction = createAction({
                name: "numberAction",
                core: (data: number[]) => ({result: data.reduce((a, b) => a * b)}),
            });

            const stringActionHandler = createAction({
                name: "stringActionHandler",
                parents: [stringAction],
                core: (data: string[]) => ({
                    result: data.join("*"),
                    children: [stringAction.createBinding(data.join("*"))],
                }),
            });
            const stringNumberActionHandler = createAction({
                name: "stringNumberActionHandler",
                parents: [stringAction, numberAction],
                core: (data: number[]) => {
                    const val = data.reduce((a, b) => a + b);
                    return {
                        result: val,
                        children: [
                            stringAction.createBinding(data.join("+")),
                            numberAction.createBinding(val),
                        ],
                    };
                },
            });

            const stringActionHandlerHandler = createAction({
                name: "stringActionHandlerHandler",
                parents: [stringActionHandler],
                core: (data: string[]) => ({
                    children: data.map(val =>
                        stringActionHandler.createBinding(`(${val})`)
                    ),
                }),
            });

            const targets = [
                {
                    actionBindings: [
                        stringAction.createBinding("hoi"),
                        numberAction.createBinding(5),
                        stringNumberActionHandler.createBinding(3),
                    ],
                },
                {
                    actionBindings: [
                        stringActionHandlerHandler.createBinding("stuffs"),
                        stringNumberActionHandler.createBinding(8),
                        stringActionHandler.createBinding("orange"),
                    ],
                },
            ];
            expect(stringAction.get(targets)).toEqual("hoi-3+8-(stuffs)*orange");
            expect(stringActionHandler.get(targets)).toEqual("(stuffs)*orange");
            expect(numberAction.get(targets)).toEqual(55); // 5 * (3 + 8)

            // n should be of type never
            const n = stringActionHandlerHandler.get(targets);
        });
    });
});
