export declare const functionFactory: {
    readonly function_1: (events: any[]) => Promise<void>;
    readonly function_2: (events: any[]) => Promise<void>;
};
export type FunctionFactoryType = keyof typeof functionFactory;
