import {FC} from "react";

export type IViewStackItem =
    | {view: FC<{onTop: boolean; index: number}> | JSX.Element; transparent: boolean}
    | FC<{onTop: boolean; index: number}>
    | JSX.Element;
