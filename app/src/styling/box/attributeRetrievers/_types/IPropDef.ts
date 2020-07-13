import {IAnyProps} from "./IAnyProps";
import {IPropValueGetter} from "./IPropValueGetter";

export type IPropDef =
    | string
    | boolean
    | ((
          props: IAnyProps,
          value: any,
          key: string,
          rawValue: any,
          getValue: IPropValueGetter
      ) => void);
