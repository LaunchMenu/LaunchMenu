import {IAction} from "../../_types/IAction";
import {IActionNode} from "../../_types/IActionNode";
import {createActionOrdering} from "../createActionOrering";

function createAction(name: string): IAction {
    return {name, get: () => {}, parents: [], transform: () => ({})};
}
function createNode(action: IAction, children: IActionNode[] = []): IActionNode {
    return {action, children, bindings: []};
}

function invalidOrderNodes(nodes: IActionNode[]): IActionNode[] {
    return nodes.filter((node, i) => {
        const childrenBefore = node.children.reduce(
            (allBefore, child) => allBefore && nodes.indexOf(child) < i,
            true
        );
        return !childrenBefore;
    });
}
function missingNodes(target: IActionNode[], nodes: IActionNode[]): IActionNode[] {
    return nodes.filter(node => !target.includes(node));
}

describe("createActionOrdering", () => {
    it("Should make sure children come before their parents", () => {
        /**
         * A -> B -> D
         *  \-> C -> E
         *       \-> F
         */
        const D = createNode(createAction("D"));
        const E = createNode(createAction("E"));
        const F = createNode(createAction("F"));
        const B = createNode(createAction("B"), [D]);
        const C = createNode(createAction("C"), [E, F]);
        const A = createNode(createAction("A"), [B, C]);
        const ordering = createActionOrdering(A);

        expect(invalidOrderNodes(ordering)).toEqual([]);
        expect(missingNodes(ordering, [A, B, C, D, E, F])).toEqual([]);

        // Validate the test tooling a bit
        const wrongOrder = [A, B, C, D, E];
        expect(invalidOrderNodes(wrongOrder)).not.toEqual([]);
        expect(missingNodes(wrongOrder, [A, B, C, D, E, F])).not.toEqual([]);
    });
    it("Should handle DAGs, not only trees", () => {
        /**
         * A -> B -> D -
         *  \-> C /     \
         *      |---------> E
         *       \-----------\-> F
         */
        const F = createNode(createAction("F"));
        const E = createNode(createAction("E"), [F]);
        const D = createNode(createAction("D"), [E]);
        const B = createNode(createAction("B"), [D]);
        const C = createNode(createAction("C"), [E, F, D]);
        const A = createNode(createAction("A"), [B, C]);
        const ordering = createActionOrdering(A);

        expect(invalidOrderNodes(ordering)).toEqual([]);
        expect(missingNodes(ordering, [A, B, C, D, E, F])).toEqual([]);
    });
    it("Should notify about cycles", () => {
        /**
         * A -> B -> D -
         *  \-> C /     \
         *      |---------> E -> A (loop)
         *       \-----------\-> F
         */
        const F = createNode(createAction("F"));
        const E = createNode(createAction("E"), [F]);
        const D = createNode(createAction("D"), [E]);
        const B = createNode(createAction("B"), [D]);
        const C = createNode(createAction("C"), [E, F, D]);
        const A = createNode(createAction("A"), [B, C]);
        E.children.push(A);

        expect(() => createActionOrdering(A)).toThrow();

        try {
            createActionOrdering(A);
        } catch (e) {
            expect(e.message).toContain("A->B->D->E->A");
        }
    });
});
