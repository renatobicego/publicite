import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

export const getEndDateISO = (monthsToAdd: number) => {
  const currentDate = today(getLocalTimeZone());
  if (monthsToAdd + currentDate.month > 12) {
    return new CalendarDate(
      currentDate.year + 1,
      (monthsToAdd + currentDate.month) % 12,
      currentDate.day
    )
      .toDate(getLocalTimeZone())
      .toISOString();
  } else {
    return new CalendarDate(
      currentDate.year,
      monthsToAdd + currentDate.month,
      currentDate.day
    )
      .toDate(getLocalTimeZone())
      .toISOString();
  }
};

export function formatDate(dateString: DateValue | string) {
  // Split the date string into an array [YYYY, MM, DD]
  const dateParts = dateString.toString().split("-");

  // Reverse the array and join with slashes to get DD/MM/YYYY
  return dateParts.reverse().join("/");
}