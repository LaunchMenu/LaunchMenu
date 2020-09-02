import {IField} from "../../../../_types/IField";
import {IMenuItem} from "../../_types/IMenuItem";

/**
 * A field menu item that can both be altered and rendered in a menu
 */
export type IFieldMenuItem<T> = IField<T> & IMenuItem;
