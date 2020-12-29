type IQueueNode<I> = {
    value: I;
    next?: IQueueNode<I>;
};

/**
 * A simple queue data type
 */
export class Queue<I> {
    protected head?: IQueueNode<I>;
    protected tail?: IQueueNode<I>;

    /**
     * Adds an item to the queue
     * @param item The item to be added
     */
    public push(item: I): void {
        const node = {value: item};
        if (this.head && this.tail) this.tail.next = node;
        else this.head = node;
        this.tail = node;
    }

    /**
     * Retrieves the first item in the queue
     * @returns The first item in the queue
     */
    public pop(): I | undefined {
        if (this.head) {
            const {value, next} = this.head;
            this.head = next;
            return value;
        }
        return undefined;
    }

    /**
     * Checks whether the queue is empty or not
     * @returns Whether the queue is empty
     */
    public isEmpty(): boolean {
        return !this.head;
    }
}
