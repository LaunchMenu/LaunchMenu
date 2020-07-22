import {IMenuItem} from "../../items/_types/IMenuItem";

export type IPrioritizedMenuItem<T = void> = {
    priority: number;
    item: IMenuItem;
    id?: string | number;
    getUpdatedPriority?: (data: T) => Promise<number>;
} & (T extends void
    ? unknown
    : {
          getUpdatedPriority: (data: T) => Promise<number>;
          id: string | number;
      });
