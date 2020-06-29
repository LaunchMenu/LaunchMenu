/**
 * Sorts the passed array in place
 * @param arr The array to sort
 * @param condition The sorting condition
 * @param start The index to start sorting at
 * @param end The index to end sorting at
 * @returns A reference to the passed array
 */
export function quickSort<T>(
    arr: T[],
    condition?: (a: T, b: T) => boolean,
    start = 0,
    end = arr.length - 1
): T[] {
    if (start >= end) return arr;

    let pivotIndex = partition(arr, condition, start, end);
    quickSort(arr, condition, start, pivotIndex);
    quickSort(arr, condition, pivotIndex + 1, end);

    return arr;
}

function swap(list: any[], a: number, b: number) {
    [list[a], list[b]] = [list[b], list[a]];
}
function partition<T>(
    arr: T[],
    condition: undefined | ((a: T, b: T) => boolean),
    start: number,
    end: number
) {
    let pivot = arr[start],
        pointer = start;

    if (condition) {
        for (let i = start; i <= end; i++) {
            if (condition(arr[i], pivot)) {
                pointer++;
                swap(arr, pointer, i);
            }
        }
    } else {
        for (let i = start; i <= end; i++) {
            if (arr[i] < pivot) {
                pointer++;
                swap(arr, pointer, i);
            }
        }
    }
    swap(arr, start, pointer);

    return pointer;
}
