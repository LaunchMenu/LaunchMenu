import {IDataHook} from "model-react";
import {createAction} from "../../createAction";
import {IActionTarget} from "../../_types/IActionTarget";
import {
    IGetConnectionGroupResult,
    IMenuItemConnectionGroupData,
} from "./_types/IMenuItemConnectionGroupData";

/**
 * Retrieves the connection group that can be used to visually connect items
 */
export const getConnectionGroupAction = createAction({
    name: "get connection group",
    core: (groups: IMenuItemConnectionGroupData[]) => ({
        result: {
            top: new Set(
                groups.map(({top}) => top).filter((top): top is Symbol => !!top)
            ),
            bottom: new Set(
                groups
                    .map(({bottom}) => bottom)
                    .filter((bottom): bottom is Symbol => !!bottom)
            ),
            skip: groups.some(({skip}) => skip),
        },
    }),

    extras: {
        /**
         * Whether the item at the given index should connect with the previous and next items
         * @param items The complete list of items
         * @param index The index of the item to check
         * @param hook The data hook to subscribe to changes
         * @returns Whether these items should connect
         */
        shouldConnect(
            items: IActionTarget[],
            index: number,
            hook?: IDataHook
        ): {previous: boolean; next: boolean} {
            if (index < 0 || index > items.length - 1)
                return {previous: false, next: false};

            // Retrieve the connection data of the main item
            const item = items[index];
            const groups = getConnectionGroupAction.get([item], hook);

            // Retrieve the connection data of the previous connection item
            let prevIndex = index,
                prevItem: IActionTarget | undefined,
                prevGroups: IGetConnectionGroupResult;
            do {
                prevItem = items[--prevIndex];
                prevGroups = prevItem && getConnectionGroupAction.get([prevItem], hook);
            } while (prevGroups?.skip && prevIndex > 0);

            // Retrieve the connection data of the next connection item
            let nextIndex = index,
                nextItem: IActionTarget | undefined,
                nextGroups: IGetConnectionGroupResult;
            do {
                nextItem = items[++nextIndex];
                nextGroups = nextItem && getConnectionGroupAction.get([nextItem], hook);
            } while (nextGroups?.skip && nextIndex < items.length - 1);

            // Check the connections
            let connectPrevious = prevGroups
                ? [...groups.top].some(group => prevGroups.bottom.has(group))
                : false;
            let connectNext = nextGroups
                ? [...groups.bottom].some(group => nextGroups.top.has(group))
                : false;

            // Return the connections
            return {next: connectNext, previous: connectPrevious};
        },
    },
});

/** The connection group for standard items */
export const standardConnectionGroup = Symbol("Standard connection");
