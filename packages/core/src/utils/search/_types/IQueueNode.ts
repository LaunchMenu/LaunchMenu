/** A node for a queue */
export type IQueueNode<I> = {
    value: I;
    next?: IQueueNode<I>;
    prev?: IQueueNode<I>;
};
