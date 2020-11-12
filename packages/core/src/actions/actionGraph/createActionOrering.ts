import {IActionNode, IActionNodeWithTargets} from "../_types/IActionNode";

export type INodeState = {
    node: IActionNode;
    started: boolean;
    finished: boolean;
};

/**
 * Creates a full ordering from the given tree, such that no action depends on the actions that come after it
 * @param tree The tree to get the full ordering for
 * @returns The full action ordering
 */
export function createActionOrdering<T extends IActionNode>(
    tree: T
): (T extends IActionNodeWithTargets ? IActionNodeWithTargets : IActionNode)[] {
    const processingTag = Symbol();
    const processedTag = Symbol();

    function recursiveCreateActionOrdering(
        node: IActionNode & {[processedTag]?: boolean; [processingTag]?: boolean},
        path: IActionNode[]
    ): IActionNode[] {
        if (node[processedTag]) return [];
        if (node[processingTag])
            throw Error(
                `An action dependency cycle was detected: ${getCycle([...path, node])
                    .map(({action}) => action.name)
                    .join("->")}`
            );
        node[processingTag] = true;

        path = [...path, node];
        const children = node.children.flatMap(child =>
            recursiveCreateActionOrdering(child, path)
        );
        const ordering = [...children, node];

        delete node[processingTag];
        node[processedTag] = true;

        return ordering;
    }

    const ordering = recursiveCreateActionOrdering(tree, []);
    ordering.forEach(
        node => delete (node as IActionNode & {[processedTag]?: boolean})[processedTag]
    );
    return ordering as (T extends IActionNodeWithTargets
        ? IActionNodeWithTargets
        : IActionNode)[];
}

/**
 * Obtains the cycle from a parent to the child, assuming one exists
 * @param path The path in which the cycle occurred
 * @returns The sequence of nodes that makes up a cycle
 */
function getCycle(path: IActionNode[]): IActionNode[] {
    const last = path[path.length - 1];
    const cycle = [last];
    for (let i = path.length - 2; i >= 0; i--) {
        cycle.unshift(path[i]);
        if (path[i] == last) return cycle;
    }
    return cycle;
}
