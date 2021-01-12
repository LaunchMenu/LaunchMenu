import {Field, IDataHook} from "model-react";
import {IUUID} from "../../_types/IUUID";
import {ExtendedObject} from "../ExtendedObject";
import {IPatternMatch} from "./_types/IPatternMatch";
import {ISearchPatternFilterConfig} from "./_types/ISearchPatternFilterConfig";
import {ISearchPatternFilterNode} from "./_types/ISearchPatternFilterNode";

/**
 * A class to filter out any results that don't have any patterns, when a pattern was found
 */
export class SearchPatternFilter<I> {
    protected onAdd: (item: I) => void;
    protected onRemove: (item: I) => void;
    protected getPatternMatch: (
        match: IPatternMatch,
        currentMatches: IPatternMatch[]
    ) => IPatternMatch | undefined;

    /** Keep track of all node results */
    protected nodes: Record<IUUID, ISearchPatternFilterNode<I>> = {};
    /** Keep track of the node that have an item result */
    protected resultNodes: Set<IUUID> = new Set();
    /** Keep track of the nodes that have a pattern  */
    protected patternNodes: Set<IUUID> = new Set();

    /** Keep track of all found patterns */
    protected patternsRaw: IPatternMatch[] = [];
    protected patterns = new Field([] as IPatternMatch[]);
    protected patternCounts: Map<IPatternMatch, number> = new Map();

    /**
     * Creates a nwe search pattern filter
     * @param config The config to be used
     */
    public constructor({
        onAdd,
        onRemove,
        getPatternMatch = (match, currentMatches) =>
            currentMatches.find(m => ExtendedObject.deepEquals(m, match)) ?? match,
    }: ISearchPatternFilterConfig<I>) {
        this.getPatternMatch = getPatternMatch;
        this.onAdd = onAdd;
        this.onRemove = onRemove;
    }

    /**
     * Retrieves the obtained patterns
     * @param hook The hook to subscribe to changes
     * @returns The patterns that were found
     */
    public getPatterns(hook?: IDataHook): IPatternMatch[] {
        return this.patterns.get(hook);
    }

    /**
     * Updates the result of the node
     * @param ID The ID of result
     * @param item The new item of the result
     * @param orPattern The new pattern of the result
     */
    public update(ID: IUUID, item?: I, orPattern?: IPatternMatch): void {
        const pattern = orPattern && this.getPatternMatch(orPattern, this.patternsRaw);

        // Find the old data
        const node = this.nodes[ID];
        let oldItem;
        let oldPattern;
        if (node) {
            oldItem = node.item;
            oldPattern = node.pattern;
        }

        // Store the new node data
        const newNode = (this.nodes[ID] = {
            ID,
            item,
            pattern,
        });

        // Check for changes
        const resultWasVisible = !!(this.patternsRaw.length > 0 && oldPattern);
        const resultIsVisible = !!(this.patternsRaw.length > 0 && pattern);
        if (
            item != oldItem ||
            // The item may not have changed, but if its visibility changed we should still trigger callback
            resultWasVisible != resultIsVisible
        ) {
            if (oldItem) {
                if (!item) this.resultNodes.delete(ID);
                this.removeResult(oldItem, node);
            }
            if (item) {
                if (!oldItem) this.resultNodes.add(ID);
                this.addResult(item, newNode);
            }
        }

        if (pattern != oldPattern) {
            // Add before remove, since removing first might lead to many items being reinserted and removed immediately afterwards

            if (pattern) {
                // Add the pattern node before updating the result, such that this result isn't removed
                if (!oldPattern) this.patternNodes.add(ID);
                this.addPattern(pattern);
            }
            if (oldPattern) {
                // Remove the pattern node before updating the result, since addResult using the new node won't add it if it's the last
                if (!pattern) this.patternNodes.delete(ID);
                this.removePattern(oldPattern);
            }
        }
    }

    /**
     * Removes the result under the given ID
     * @param ID The ID of the result to be removed
     */
    public remove(ID: IUUID): void {
        const node = this.nodes[ID];
        if (!node) return;

        // Remove the item and pattern data
        const {item, pattern} = node;
        if (item) {
            this.removeResult(item, node);
            this.resultNodes.delete(ID);
        }
        if (pattern) {
            this.removePattern(pattern);
            this.patternNodes.delete(ID);
        }

        // Delete the node itself
        delete this.nodes[ID];
    }

    /**
     * Adds a pattern to the set, preventing duplicates, and automatically updating the result items
     * @param newPattern The pattern to be added
     */
    protected addPattern(newPattern: IPatternMatch): void {
        // If this was the first pattern match, remove any unmatched items
        if (this.patternsRaw.length == 0) {
            this.resultNodes.forEach(resultID => {
                if (!this.patternNodes.has(resultID)) {
                    const node = this.nodes[resultID];
                    const item = node.item;
                    if (item) this.removeResult(item, node);
                }
            });
        }

        // Add the match
        if (!this.patternsRaw.includes(newPattern)) {
            this.patternsRaw.push(newPattern);
            this.patterns.set([...this.patternsRaw]);
            this.patternCounts.set(newPattern, 1);
        } else {
            const count = this.patternCounts.get(newPattern);
            this.patternCounts.set(newPattern, (count ?? 0) + 1);
        }
    }

    /**
     * Removes a pattern from the set, only if all occurrences are removed, and automatically updating the result items
     * @param oldPattern The pattern to be removed
     */
    protected removePattern(oldPattern: IPatternMatch): void {
        const patternDataIndex = this.patternsRaw.indexOf(oldPattern);
        if (patternDataIndex != -1) {
            const count = this.patternCounts.get(oldPattern);
            const newCount = (count ?? 1) - 1;
            this.patternCounts.set(oldPattern, newCount);
            if (newCount == 0) {
                this.patternsRaw.splice(patternDataIndex, 1);
                this.patternCounts.delete(oldPattern);
                this.patterns.set([...this.patternsRaw]);

                // If this was the last pattern match, add back unmatched items
                if (this.patternsRaw.length == 0) {
                    this.resultNodes.forEach(resultID => {
                        if (!this.patternNodes.has(resultID)) {
                            const node = this.nodes[resultID];
                            const item = node.item;
                            if (item) this.addResult(item, node);
                        }
                    });
                }
            }
        }
    }

    /**
     * Outputs the new result item, only adds the item when it fulfills the pattern criteria
     * @param result The item to be outputted
     * @param node The node to check the conditions for
     */
    protected addResult(result: I, node: ISearchPatternFilterNode<I>): void {
        if (this.patternsRaw.length == 0 || node.pattern) {
            this.onAdd?.(result);
        }
    }

    /**
     * Removes the result item, only removes the item when it fulfills the pattern criteria
     * @param result The item to be removed
     * @param node The node to check the conditions for
     */
    protected removeResult(result: I, node: ISearchPatternFilterNode<I>): void {
        if (this.patternsRaw.length == 0 || node.pattern) {
            this.onRemove?.(result);
        }
    }
}
