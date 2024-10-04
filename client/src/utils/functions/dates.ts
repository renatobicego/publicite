import {
  CalendarDate,
  DateValue,
  getLocalTimeZone,
  today,
} from "@internationalized/date";

export const getEndDateISO = (
  timeToAdd: number,
  frequency: "days" | "months" | undefined = "months"
) => {
  const currentDate = today(getLocalTimeZone());
  switch (frequency) {
    case "days":
      return new CalendarDate(
        currentDate.year,
        currentDate.month,
        currentDate.day + timeToAdd
      )
        .toDate(getLocalTimeZone())
        .toISOString();
    case "months":
      if (timeToAdd + currentDate.month > 12) {
        return new CalendarDate(
          currentDate.year + 1,
          (timeToAdd + currentDate.month) % 12,
          currentDate.day
        )
          .toDate(getLocalTimeZone())
          .toISOString();
      } else {
        return new CalendarDate(
          currentDate.year,
          timeToAdd + currentDate.month,
          currentDate.day
        )
          .toDate(getLocalTimeZone())
          .toISOString();
      }
  }
};

export function formatDate(dateString?: DateValue | string) {
  if (!dateString) return "Sin fecha";
  // Split the date string into an array [YYYY, MM, DD]
  const dateParts = dateString.toString().split("-");

  // Reverse the array and join with slashes to get DD/MM/YYYY
  return dateParts.reverse().join("/");
}

export const getTimeBetweenToday = (date1: DateValue) => {
  const diffTime = today(getLocalTimeZone()).compare(date1);
  if (diffTime === 0) return "hoy";
  if (diffTime === 1) return "ayer";
  if (diffTime > 1 && diffTime < 31) return `hace ${diffTime} dias`;
  if (diffTime > 30) return `hace ${Math.ceil(diffTime / 30)} meses`;
};

const shortMonths = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export const showDate = (date: DateValue) => {
  return `${date.day} ${shortMonths[date.month - 1]}. ${date.year}`;
};
