export type IStartupController = {
    /**
     * Registers LM to run at startup
     */
    register: () => Promise<void>;
    /**
     * Deregisters LM from running at startup
     */
    deregister: () => Promise<void>;
    /**
     * Checks whether LM is registered to run at startup
     * @returns Whether registered to run at startup
     */
    isRegistered: () => Promise<boolean>;
};
