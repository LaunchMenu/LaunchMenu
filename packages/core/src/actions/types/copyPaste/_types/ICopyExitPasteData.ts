import {IActionBinding} from "../../../_types/IActionBinding";
import {IExitCallbackResponse} from "../../execute/types/_types/IExitLMExecuteData";

/** The copy exit paste data without the additional binding constraints */
export type ICopyExitPasteData =
    | string
    | ({copy: IActionBinding | string; paste?: IActionBinding} & Exclude<
          IExitCallbackResponse,
          void
      >);
