export type IStartupController = {
    /**
     * Registers LM to run at startup
     * @param exeLocation The absolute path that the exe is located at
     */
    register: (exeLocation: string) => Promise<void>;
    /**
     * Deregisters LM from running at startup
     * @param exeLocation The absolute path that the exe is located at
     */
    deregister: (exeLocation: string) => Promise<void>;
    /**
     * Checks whether LM is registered to run at startup
     * @param exeLocation The absolute path that the exe is located at
     * @returns Whether registered to run at startup
     */
    isRegistered: (exeLocation: string) => Promise<boolean>;
};
