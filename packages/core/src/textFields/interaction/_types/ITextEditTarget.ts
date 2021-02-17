import {ITextField} from "../../_types/ITextField";
import {ITextEditCommand} from "../commands/_types/ITextEditCommand";

/** The possible targets for a text input */
export type ITextEditTarget =
    | ITextField
    | {
          /** The textfield to be altered */
          textField: ITextField;
          /** The callback for the created commands to alter the field */
          onChange: (command: ITextEditCommand) => void;
      };
