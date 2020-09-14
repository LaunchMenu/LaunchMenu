export type IMultiSelectOption<T> =
    | {
          /** The value for the option */
          value: T;
          /** Whether this option should not be selectable */
          disabled?: boolean;
      }
    | T;
