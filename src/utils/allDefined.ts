export const defined = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined
}

export const isNullOrUndefined =
    <T>(value: T | null | undefined): value is null | undefined => {
        return value === undefined || value === null;
    };

export const includesNullOrUndefined = <T>(arr: (T | null | undefined)[]):
    arr is (T | null | undefined)[] => {
    return arr.findIndex(isNullOrUndefined) !== -1;
}

export const everyDefined = <T>(arr: (T | null | undefined)[]):
    arr is T[] => {
    return arr.every(defined);
}


export default includesNullOrUndefined;