import {Resource} from "./Resource";
/**
 * This resource represents the whole application.
 * It can be used to specify a command can depend on anything in the application, such that you don't have to create a resource for the precise thing (It may slow things down because of less concurrency though).
 */
export const applicationResource = new Resource();
