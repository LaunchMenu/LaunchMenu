import {IDataHook} from "model-react";
import {SearchExecuter} from "../SearchExecuter";
import {IPatternMatch} from "./IPatternMatch";
import {ISearchable, ISearchableResult} from "./ISearchable";

/**
 * A function that is used to adjust a given searchable result
 */
export type ISearchableAdjuster<Q, I> =
    | ISearchableAdjusterFunc<Q, I, ISearchableResult<Q, I>>
    | {
          /** A function to adjust the item */
          item?: ISearchableAdjusterFunc<Q, I, I | undefined>;
          /** A function to adjust the children */
          children?: ISearchableAdjusterFunc<Q, I, ISearchable<Q, I>[]>;
          /** A function to adjust the pattern match */
          patternMatch?: ISearchableAdjusterFunc<Q, I, IPatternMatch | undefined>;
      };

/**
 * A single adjuster function
 */
export type ISearchableAdjusterFunc<Q, I, E> = (
    /** The original search result to be modified */
    original: E,
    /** The arguments that were provided to the original search */
    args: {query: Q; hook: IDataHook; executer?: SearchExecuter<Q, I>}
) => Promise<E> | E;
