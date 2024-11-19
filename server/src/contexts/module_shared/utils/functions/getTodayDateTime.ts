import { getLocalTimeZone, now } from "@internationalized/date";

function getTodayDateTime(): string {
    return now(getLocalTimeZone()).toString()
}

export { getTodayDateTime };