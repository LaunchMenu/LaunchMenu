import {Field} from "model-react";
import {createFieldMenuItem} from "../../../../menus/items/inputs/createFieldMenuItem";
import {IActionBinding} from "../../../_types/IActionBinding";

// export function createSimpleSearchHandlerMethodSettings(){
//     const field = new Field(null as IActionBinding);
//     return  createFieldMenuItem({
//         init: {
//             get: h=>
//         },
//         data: field => ({
//             name,
//             valueView: <Loader>{h => field.get(h)}</Loader>,
//             tags: adjustSubscribable(tags, (tags, h) => [
//                 "field",
//                 ...tags,
//                 field.get(h).toString(),
//             ]),
//             resetUndoable,
//             actionBindings: adjustSubscribable(actionBindings, bindings => [
//                 ...bindings,
//                 options
//                     ? numberInputSelectExecuteHandler.createBinding({
//                           field,
//                           options,
//                           allowCustomInput,
//                           liveUpdate: liveUpdate as any,
//                           undoable,
//                           min,
//                           max,
//                           baseValue,
//                           increment,
//                       })
//                     : numberInputExecuteHandler.createBinding({
//                           field,
//                           liveUpdate: liveUpdate as any,
//                           undoable,
//                           min,
//                           max,
//                           baseValue,
//                           increment,
//                       }),
//             ]),
//             ...rest,
//         });
// }
