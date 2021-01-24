import {INode} from "../_types/INode";

/**
 * Retrieves the items in a node
 * @param node The node to get the items from
 * @param getItem Retrieves the item data from a given node
 * @returns The obtained items
 */
export function getListItems<T>(node: INode, getItem: (node: Element) => T): T[] {
    const listItems = [...node.querySelectorAll("li,dd")];
    const subListItems = [...node.querySelectorAll("li li,li dd,dd li,dd dd")];
    const includedItems = listItems.filter(item => !subListItems.includes(item));
    if (includedItems.length <= 1) {
        const childNodes = [...(includedItems[0] ?? node).childNodes];

        const nodes: HTMLElement[] = [];
        let item: ChildNode[] = [];
        const addItem = () => {
            if (item.length > 0) {
                const itemNode = document.createElement("span");
                itemNode.append(...item);
                item = [];
                nodes.push(itemNode);
            }
        };

        childNodes.forEach(node => {
            if (node instanceof Text) {
                const parts = node.textContent?.split(",") ?? [];
                parts.forEach((part, i) => {
                    if (i > 0) addItem();
                    item.push(document.createTextNode(part));
                });
            } else {
                item.push(node);
            }
        });

        addItem();

        return nodes.map(getItem);
    }

    return includedItems.map(getItem);
}
