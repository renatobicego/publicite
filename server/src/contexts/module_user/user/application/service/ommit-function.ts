import { omitBy } from "lodash";

export function ommitUndefinedValues(object: any) {

    const result = omitBy(
        object,
        (value) => value === undefined || value === null,
    )
    return result;


} 