import {Field, Observer} from "model-react";
import {wait} from "../../../_tests/wait.helper";
import {IAction} from "../../_types/IAction";
import {IActionBinding} from "../../_types/IActionBinding";
import {IActionNode} from "../../_types/IActionNode";
import {IActionTarget} from "../../_types/IActionTarget";
import {IIndexedActionBinding} from "../../_types/IIndexedActionBinding";
import {createActionHandlerTree} from "../createActionHandlerTree";

function createBinding<A extends IAction>(action: A): IActionBinding<A> {
    return {action, data: {} as any};
}
function createAction(name: string, parents: IAction[]): IAction {
    return {name, get: () => {}, parents, transform: () => ({})};
}

function getBindingData(bindings: IActionBinding[] = []): any[] {
    return bindings.map(binding =>
        "data" in binding ? binding.data : binding.subscribableData
    );
}
function getBindingIndices(bindings: IIndexedActionBinding[] = []): any[] {
    return bindings.map(binding => binding.index);
}

function getNode(tree: IActionNode, path: IAction[]): IActionNode | undefined {
    let an = tree as IActionNode | undefined;
    for (let i = 0; i < path.length; i++) {
        const action = path[i];
        an = an && an.children.find(({action: ac}) => action == ac);
    }
    return an;
}
function getChildren(tree: IActionNode, path: IAction[]): IAction[] {
    return getNode(tree, path)?.children.map(({action}) => action) || [];
}

describe("createActionHandlerTree", () => {
    it("Should properly convert the parent structure to children structure", () => {
        /**
         * A -> B ---> D -\
         *  \-> C -/      -> F
         *       \---> E -/
         */
        const A = createAction("A", []);
        const B = createAction("B", [A]);
        const C = createAction("C", [A]);
        const D = createAction("D", [B, C]);
        const E = createAction("E", [C]);
        const F = createAction("F", [D, E]);
        const actions = [A, B, C, D, E, F];

        const targets: IActionTarget[] = [
            {
                actionBindings: actions.slice(0, 4).map(a => createBinding(a)),
            },
            {actionBindings: actions.slice(4).map(a => createBinding(a))},
        ];

        const tree = createActionHandlerTree(A, targets);
        expect(getChildren(tree, [])).toEqual([B, C]);
        expect(getChildren(tree, [B])).toEqual([D]);
        expect(getChildren(tree, [C])).toEqual([D, E]);
        expect(getChildren(tree, [B, D])).toEqual([F]);
        expect(getChildren(tree, [C, E])).toEqual([F]);
    });
    it("Should only keep the DAG with the root that was passed", () => {
        /**
         * A -> B ---> D -\
         *  \-> C -/      -> F
         * G /   \---> E -/
         */
        const A = createAction("A", []);
        const G = createAction("G", []);
        const B = createAction("B", [A]);
        const C = createAction("C", [A, G]);
        const D = createAction("D", [B, C]);
        const E = createAction("E", [C]);
        const F = createAction("F", [D, E]);
        const actions = [A, B, C, D, E, F, G];

        const targets: IActionTarget[] = [
            {
                actionBindings: actions.slice(0, 4).map(a => createBinding(a)),
            },
            {actionBindings: actions.slice(4).map(a => createBinding(a))},
        ];

        const tree = createActionHandlerTree(C, targets);
        expect(getChildren(tree, [])).toEqual([D, E]);
        expect(getChildren(tree, [D])).toEqual([F]);
        expect(getChildren(tree, [E])).toEqual([F]);
    });
    it("Should not include actions for which no bindings are specified", () => {
        /**
         * A -> B ---> D -\
         *  \-> C -/      -> F
         *       \---> E -/
         */
        const A = createAction("A", []);
        const B = createAction("B", [A]);
        const C = createAction("C", [A]);
        const D = createAction("D", [B, C]);
        const E = createAction("E", [C]);
        const F = createAction("F", [D, E]);
        const actions = [A, B, C, D, E, F];

        const targets: IActionTarget[] = [
            {
                actionBindings: actions.slice(0, 4).map(a => createBinding(a)),
            },
        ];

        const tree = createActionHandlerTree(A, targets);
        expect(getChildren(tree, [])).toEqual([B, C]);
        expect(getChildren(tree, [B])).toEqual([D]);
        expect(getChildren(tree, [C])).toEqual([D]);
        expect(getChildren(tree, [B, D])).toEqual([]);
    });
    it("Should retain the binding data", () => {
        /**
         * A -> B ---> D -\
         *  \-> C -/      -> F
         *       \---> E -/
         */
        const A = createAction("A", []);
        const B = createAction("B", [A]);
        const C = createAction("C", [A]);
        const D = createAction("D", [B, C]);
        const E = createAction("E", [C]);
        const F = createAction("F", [D, E]);
        const bA1 = createBinding(A),
            bA2 = createBinding(A),
            bB1 = createBinding(B),
            bB2 = createBinding(B),
            bC1 = createBinding(C),
            bC2 = createBinding(C),
            bD1 = createBinding(D),
            bD2 = createBinding(D),
            bE1 = createBinding(E),
            bE2 = createBinding(E),
            bF1 = createBinding(F),
            bF2 = createBinding(F);
        const targets: IActionTarget[] = [
            {
                actionBindings: [bA1, bB1, bC1, bD1, bE1, bF1],
            },
            {actionBindings: [bA2, bB2, bC2, bD2, bE2, bF2]},
        ];

        const tree = createActionHandlerTree(A, targets);
        expect(getChildren(tree, [])).toEqual([B, C]);
        expect(getChildren(tree, [B])).toEqual([D]);
        expect(getChildren(tree, [C])).toEqual([D, E]);
        expect(getChildren(tree, [B, D])).toEqual([F]);
        expect(getChildren(tree, [C, E])).toEqual([F]);

        // Check the binding data is properly stored
        expect(getBindingData(tree.bindings)).toEqual(getBindingData([bA1, bA2]));
        expect(getBindingIndices(tree.bindings)).toEqual([0, 6]);
        expect(getBindingData(getNode(tree, [B])?.bindings)).toEqual(
            getBindingData([bB1, bB2])
        );
        expect(getBindingIndices(getNode(tree, [B])?.bindings)).toEqual([1, 7]);
        expect(getBindingData(getNode(tree, [C])?.bindings)).toEqual(
            getBindingData([bC1, bC2])
        );
        expect(getBindingIndices(getNode(tree, [C])?.bindings)).toEqual([2, 8]);
        expect(getBindingData(getNode(tree, [B, D])?.bindings)).toEqual(
            getBindingData([bD1, bD2])
        );
        expect(getBindingIndices(getNode(tree, [B, D])?.bindings)).toEqual([3, 9]);
        expect(getBindingData(getNode(tree, [C, E])?.bindings)).toEqual(
            getBindingData([bE1, bE2])
        );
        expect(getBindingIndices(getNode(tree, [C, E])?.bindings)).toEqual([4, 10]);
        expect(getBindingData(getNode(tree, [B, D, F])?.bindings)).toEqual(
            getBindingData([bF1, bF2])
        );
        expect(getBindingIndices(getNode(tree, [B, D, F])?.bindings)).toEqual([5, 11]);
    });
    it("Should inform about changes", async () => {
        /**
         * A -> B ---> D -\
         *  \-> C -/      -> F
         *       \---> E -/
         */
        const A = createAction("A", []);
        const B = createAction("B", [A]);
        const C = createAction("C", [A]);
        const D = createAction("D", [B, C]);
        const E = createAction("E", [C]);
        const F = createAction("F", [D, E]);
        const actions = [A, B, C, D, E, F];

        const bindings = new Field(actions.slice(4).map(a => createBinding(a)));
        const targets: IActionTarget[] = [
            {actionBindings: actions.slice(0, 4).map(a => createBinding(a))},
            {
                actionBindings: h => bindings.get(h),
            },
        ];

        const listener = jest.fn();
        new Observer(h => createActionHandlerTree(A, targets, h)).listen(listener, true);

        bindings.set([]);
        await wait();

        expect(listener).toBeCalledTimes(2);

        const tree1 = listener.mock.calls[0][0];
        expect(getChildren(tree1, [])).toEqual([B, C]);
        expect(getChildren(tree1, [B])).toEqual([D]);
        expect(getChildren(tree1, [C])).toEqual([D, E]);
        expect(getChildren(tree1, [B, D])).toEqual([F]);
        expect(getChildren(tree1, [C, E])).toEqual([F]);

        const tree2 = listener.mock.calls[1][0];
        expect(getChildren(tree2, [])).toEqual([B, C]);
        expect(getChildren(tree2, [B])).toEqual([D]);
        expect(getChildren(tree2, [C])).toEqual([D]);
        expect(getChildren(tree2, [B, D])).toEqual([]);
    });
    it("Should properly handle absence of parent actions", () => {
        /**
         * A -> B ---> D -\
         *  \-> C -/      -> F
         *       \---> E -/
         */
        const A = createAction("A", []);
        const B = createAction("B", [A]);
        const C = createAction("C", [A]);
        const D = createAction("D", [B, C]);
        const E = createAction("E", [C]);
        const F = createAction("F", [D, E]);

        const targets: IActionTarget[] = [
            {
                actionBindings: [createBinding(F)],
            },
        ];

        const tree = createActionHandlerTree(A, targets);
        expect(getChildren(tree, [])).toEqual([B, C]);
        expect(getChildren(tree, [B])).toEqual([D]);
        expect(getChildren(tree, [C])).toEqual([D, E]);
        expect(getChildren(tree, [B, D])).toEqual([F]);
        expect(getChildren(tree, [C, E])).toEqual([F]);
    });
});
