import {Field, IDataHook} from "model-react";
import {Observer} from "../../../utils/modelReact/Observer";
import {wait} from "../../../_tests/wait.helper";
import {IAction} from "../../_types/IAction";
import {IActionNode} from "../../_types/IActionNode";
import {IActionTransformer} from "../../_types/IActionTransformer";
import {reduceActions} from "../reduceActions";

function createAction(
    name: string,
    transformer: IActionTransformer<any, any, any>
): IAction {
    return {
        transform: transformer,
        name,
        parents: [],
        get: () => {},
    };
}
function createNode<I>(
    action: IAction<I, any, any>,
    children: IActionNode[] = [],
    bindingsData: [I | ((h: IDataHook) => I), number][] = []
): IActionNode {
    return {
        action,
        children,
        bindings: bindingsData.map(([data, index]) => ({
            action,
            index,
            ...(data instanceof Function ? {subscribableData: data} : {data}),
        })),
    };
}

describe("reduceActions", () => {
    it("Should properly apply the transformer of the action", () => {
        const action = createAction("A", (inp: string[]) => ({result: inp.join("-")}));
        const node = createNode(
            action,
            [],
            [
                ["hoi", 0],
                ["bye", 1],
            ]
        );
        const result = reduceActions([node]);

        expect(result?.result).toEqual("hoi-bye");
    });
    it("Should forward results of handlers", () => {
        const action = createAction("A", (inp: string[]) => ({result: inp.join("-")}));
        const actionHandler = createAction("B", (inp: string[]) => ({
            children: [{action, data: inp.join("+")}],
        }));

        const handlerNode = createNode(
            actionHandler,
            [],
            [
                ["hoi", 0],
                ["bye", 1],
            ]
        );
        const node = createNode(action, [handlerNode], [["stuff", 2]]);
        const result = reduceActions([handlerNode, node]);

        expect(result?.result).toEqual("hoi+bye-stuff");
    });
    it("Should forward multiple layers of results of handlers", () => {
        const action = createAction("A", (inp: string[]) => ({result: inp.join("-")}));
        const actionHandler = createAction("B", (inp: string[]) => ({
            children: [{action, data: inp.join("+")}],
        }));
        const actionHandlerHandler = createAction("C", (inp: string[]) => ({
            children: inp.map(d => ({action: actionHandler, data: `(${d})`})),
        }));

        const handlerHandlerNode = createNode(
            actionHandlerHandler,
            [],
            [
                ["hoi", 0],
                ["bye", 1],
            ]
        );
        const handlerNode = createNode(
            actionHandler,
            [handlerHandlerNode],
            [
                ["oranges", 2],
                ["potatoes", 3],
            ]
        );
        const node = createNode(action, [handlerNode], [["stuff", 4]]);
        const result = reduceActions([handlerHandlerNode, handlerNode, node]);

        expect(result?.result).toEqual("(hoi)+(bye)+oranges+potatoes-stuff");
    });
    it("Should skip actions without bindings, except for the last", () => {
        const actionMock = jest.fn((inp: string[]) => ({result: inp.join("-")}));
        const actionHandlerMock = jest.fn((inp: string[]) => ({
            children: [{action, data: inp.join("+")}],
        }));
        const action = createAction("A", actionMock);
        const actionHandler = createAction("B", actionHandlerMock);

        const handlerNode = createNode(actionHandler, [], []);
        const node = createNode(action, [handlerNode], []);
        const result = reduceActions([handlerNode, node]);

        expect(result?.result).toEqual("");
        expect(actionMock).toBeCalledTimes(1);
        expect(actionHandlerMock).toBeCalledTimes(0);
    });
    describe("ordering", () => {
        it("Should pass the inputs in the order of their bindings", () => {
            const action = createAction("A", (inp: string[]) => ({
                result: inp.join("-"),
            }));
            const node = createNode(
                action,
                [],
                [
                    ["stuff", 0],
                    ["oranges", 1],
                ]
            );
            const result = reduceActions([node]);
            expect(result?.result).toEqual("stuff-oranges");
        });
        it("Should decide combined handlers indices to be the same as their first input's index", () => {
            const action = createAction("A", (inp: string[]) => ({
                result: inp.join("-"),
            }));
            const actionHandler = createAction("B", (inp: string[]) => ({
                children: [{action, data: inp.join("+")}],
            }));

            const handlerNode1 = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 1],
                ]
            );
            const node1 = createNode(action, [handlerNode1], [["stuff", 2]]);
            const result = reduceActions([handlerNode1, node1]);
            expect(result?.result).toEqual("oranges+potatoes-stuff");

            const handlerNode2 = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 2],
                ]
            );
            const node2 = createNode(action, [handlerNode2], [["stuff", 1]]);
            const result2 = reduceActions([handlerNode2, node2]);
            expect(result2?.result).toEqual("oranges+potatoes-stuff");

            const handlerNode3 = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 1],
                    ["potatoes", 2],
                ]
            );
            const node3 = createNode(action, [handlerNode3], [["stuff", 0]]);
            const result3 = reduceActions([handlerNode3, node3]);
            expect(result3?.result).toEqual("stuff-oranges+potatoes");
        });
        it("Should decide mapped handlers indices to be the same as their inputs", () => {
            const action = createAction("A", (inp: string[]) => ({
                result: inp.join("-"),
            }));
            const actionHandler = createAction("B", (inp: string[]) => ({
                children: inp.map(d => ({action, data: `(${d})`})),
            }));

            const handlerNode = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 2],
                ]
            );
            const node = createNode(
                action,
                [handlerNode],
                [
                    ["stuff", 1],
                    ["crap", 3],
                ]
            );
            const result = reduceActions([handlerNode, node]);
            expect(result?.result).toEqual("(oranges)-stuff-(potatoes)-crap");
        });
        it("Should decide mapped handlers indices to be the same as their inputs for multiple actions", () => {
            const action = createAction("A", (inp: string[]) => ({
                result: inp.join("-"),
            }));
            const action2 = createAction("B", (inp: string[]) => ({
                result: inp.join("*"),
            }));
            const actionHandler = createAction("C", (inp: string[]) => ({
                children: [
                    ...inp.map(d => ({action, data: `(${d})`})),
                    ...inp.map(d => ({action: action2, data: `[${d}]`})),
                ],
            }));

            const handlerNode = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 2],
                ]
            );
            const node = createNode(
                action,
                [handlerNode],
                [
                    ["stuff", 1],
                    ["crap", 3],
                ]
            );
            const result = reduceActions([handlerNode, node]);
            expect(result?.result).toEqual("(oranges)-stuff-(potatoes)-crap");

            const handlerNode2 = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 2],
                ]
            );
            const node2 = createNode(
                action2,
                [handlerNode2],
                [
                    ["stuff", 1],
                    ["crap", 3],
                ]
            );
            const result2 = reduceActions([handlerNode2, node2]);
            expect(result2?.result).toEqual("[oranges]*stuff*[potatoes]*crap");
        });
        it("Should allow for manual index assignment", () => {
            const action = createAction("A", (inp: string[]) => ({
                result: inp.join("-"),
            }));
            const actionHandler = createAction("B", (inp: string[], indices) => ({
                children: inp.map((d, i) => ({
                    action,
                    data: `(${d})`,
                    index: indices[indices.length - 1 - i],
                })),
            }));

            const handlerNode = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 2],
                ]
            );
            const node = createNode(
                action,
                [handlerNode],
                [
                    ["stuff", 1],
                    ["crap", 3],
                ]
            );
            const result = reduceActions([handlerNode, node]);
            expect(result?.result).toEqual("(potatoes)-stuff-(oranges)-crap");
        });
        it("Should keep the order when the indices are the same", () => {
            const action = createAction("A", (inp: string[]) => ({
                result: inp.join("-"),
            }));
            const actionHandler = createAction("B", (inp: string[], indices) => ({
                children: [
                    {action, data: inp.join("+"), index: indices[0] ?? Infinity},
                    {action, data: inp.join("*"), index: indices[0] ?? Infinity},
                ],
            }));

            const handlerNode1 = createNode(
                actionHandler,
                [],
                [
                    ["oranges", 0],
                    ["potatoes", 1],
                    ["things", 3],
                ]
            );
            const node1 = createNode(action, [handlerNode1], [["stuff", 2]]);
            const result = reduceActions([handlerNode1, node1]);
            expect(result?.result).toEqual(
                "oranges+potatoes+things-oranges*potatoes*things-stuff"
            );
        });
    });
    it("Should inform about changes", async () => {
        const action = createAction("A", (inp: string[]) => ({result: inp.join("-")}));
        const actionHandler = createAction("B", (inp: string[]) => ({
            children: [{action, data: inp.join("+")}],
        }));
        const actionHandlerHandler = createAction("C", (inp: string[]) => ({
            children: inp.map(d => ({action: actionHandler, data: `(${d})`})),
        }));

        const oranges = new Field("oranges");
        const handlerHandlerNode = createNode(
            actionHandlerHandler,
            [],
            [
                ["hoi", 0],
                ["bye", 1],
            ]
        );
        const handlerNode = createNode(
            actionHandler,
            [handlerHandlerNode],
            [
                [h => oranges.get(h), 2],
                ["potatoes", 3],
            ]
        );
        const node = createNode(action, [handlerNode], [["stuff", 4]]);

        const listener = jest.fn();
        new Observer(h =>
            reduceActions([handlerHandlerNode, handlerNode, node], h)
        ).listen(listener, true);

        oranges.set("smth");
        await wait();

        expect(listener).toBeCalledTimes(2);
        expect(listener.mock.calls[0][0].result).toEqual(
            "(hoi)+(bye)+oranges+potatoes-stuff"
        );
        expect(listener.mock.calls[1][0].result).toEqual(
            "(hoi)+(bye)+smth+potatoes-stuff"
        );
    });
});
