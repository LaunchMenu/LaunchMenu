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

            const subscribableBinding = action.createBinding({
                subscribableData: () => "yes",
            });
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

            // The below isn't allowed, and will result in an error on a2 when the comment is removed
            /** @ts-expect-error */
            const binding2 = action.createBinding({a1: true, a2: "true"});
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
        it("Should correctly reduce the result of multiple bindings and handlers test 2", () => {
            /**
             *    ┍━━━━ listDashHandler
             *    │
             *    ∨
             * list <━━ listBulletPointHandler <━━ specialListItemsHandler
             *            ∧
             *            │
             * names <━━ namesAndBulletPointListHandler
             */

            const names = createAction({
                name: "names",
                core: (names: string[]) => ({result: names}),
            });

            const list = createAction({
                name: "list",
                core: (names: string[]) => {
                    const namesString = names.join("\n");
                    return {result: namesString};
                },
            });

            const listBulletPointHandler = createAction({
                name: "listBulletPointHandler",
                parents: [list],
                core: (names: string[], indices: number[]) => {
                    const bulletPointNames = names.map(name => `• ${name}`);
                    return {
                        children: bulletPointNames.map(bulletPointName =>
                            list.createBinding({data: bulletPointName, index: indices[0]})
                        ),
                        result: bulletPointNames,
                    };
                },
            });
            const listDashHandler = createAction({
                name: "listDashHandler",
                parents: [list],
                core: (names: string[]) => {
                    const bulletPointNames = names.map(name => `- ${name}`);
                    return {
                        children: bulletPointNames.map(bulletPointName =>
                            list.createBinding(bulletPointName)
                        ),
                        result: bulletPointNames,
                    };
                },
            });

            const specialListItemsHandler = createAction({
                name: "specialListItemsHandler",
                parents: [listBulletPointHandler], // Notice that we can create handlers, for handlers
                core: (names: string[]) => {
                    const bulletPointNames = names.map(name => `  * ${name}`);
                    const specialList = ["special:", ...bulletPointNames].join("\n");
                    return {
                        children: [listBulletPointHandler.createBinding(specialList)],
                        // Note that we don't return a result, thus specialListItemsHandler.get([...]) on its own is useless
                    };
                },
            });

            const namesAndBulletPointListHandler = createAction({
                name: "namesAndBulletPointListHandler",
                parents: [names, listBulletPointHandler],
                core: (inpNames: string[]) => ({
                    children: [
                        ...inpNames.map(name =>
                            listBulletPointHandler.createBinding(name)
                        ),
                        ...inpNames.map(name => names.createBinding(name)),
                    ],
                }),
            });

            const items = [
                {actionBindings: [listDashHandler.createBinding("item1")]},
                {actionBindings: [listBulletPointHandler.createBinding("item2")]},
                {actionBindings: [specialListItemsHandler.createBinding("item3")]},
                {actionBindings: [namesAndBulletPointListHandler.createBinding("item4")]},
                {actionBindings: [specialListItemsHandler.createBinding("item5")]},
                {actionBindings: [listDashHandler.createBinding("item6")]},
                {actionBindings: [namesAndBulletPointListHandler.createBinding("item7")]},
            ];

            const listResult = list.get(items);
            expect(listResult).toEqual(
                "- item1\n• item2\n• special:\n  * item3\n  * item5\n• item4\n• item7\n- item6"
            );

            const namesResult = names.get(items);
            expect(namesResult).toEqual(["item4", "item7"]);
        });
    });
});
