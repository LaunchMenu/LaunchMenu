import { ICommand } from "./_types/ICommand";
import { Field } from "model-react";

// /**
//  * A base class for
//  */
// export abstract class Command implements ICommand {

// }

// export class AddOneCmd extends Command {
//     protected prev: number | undefined;
//     protected target: Field<number>;
//     public constructor(target: Field<number>){
//         this.target = target;
//     }
//     public async onExecute(): Promise<void> {
//         this.prev = this.target.get(null);
//         this.target.set(this.prev+1);
//     }
//     public async onRevert(): Promise<void> {
//         if(this.prev!=undefined) this.target.set(this.prev);
//     }
// }

// export function createAddOneCmd(target: Field<number>){
//     let prev: number | undefined;
//     return createCommand({
//         onExecute(){
//             prev = target.get(null);
//             target.set(prev+1);
//         },
//         onRevert(){
//             if(prev) this.target.set(prev);
//         }
//     });
// }