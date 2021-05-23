import {IQueueNode} from "./search/_types/IQueueNode";

/**
 * A simple queue data type
 */
export class Queue<I> {
    protected head?: IQueueNode<I>;
    protected tail?: IQueueNode<I>;
    protected size: number = 0;

    /**
     * Adds an item to the queue
     * @param item The item to be added
     * @returns THe created node which can be used to remove the item from the queue
     */
    public push(item: I): IQueueNode<I> {
        // Link the nodes (and possibly set the head)
        const node: IQueueNode<I> = {value: item};
        if (this.head && this.tail) {
            this.tail.prev = node;
            node.next = this.tail;
        } else this.head = node;
        this.tail = node;
        this.size++;

        return node;
    }

    /**
     * Retrieves the first item in the queue
     * @returns The first item in the queue
     */
    public pop(): I | undefined {
        if (this.head) {
            const head = this.head;
            this.head = head.prev;
            if (head.prev) {
                head.prev.next = undefined;
                head.prev = undefined;
            }
            this.size--;
            return head.value;
        }
        return undefined;
    }

    /**
     * Removes a given node from the queue
     * @param node The node to be removed
     * @returns Whether the node was still present
     */
    public removeNode(node: IQueueNode<I>): boolean {
        if (node.prev && node.next) {
            node.prev.next = node.next;
            node.next.prev = node.prev;
        } else if (node.prev) this.head = node.prev;
        else if (node.next) this.tail = node.next;
        else return false;

        this.size--;
        return true;
    }

    /**
     * Retrieves the size of this queue
     * @returns The size of the queue
     */
    public getSize(): number {
        return this.size;
    }

    /**
     * Checks whether the queue is empty or not
     * @returns Whether the queue is empty
     */
    public isEmpty(): boolean {
        return !this.head;
    }
}
