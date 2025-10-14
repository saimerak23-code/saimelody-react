export const ApiUrl: string = "https://saimelodies.org";
export const Pd: string = "b#ZkiX6Sai";
export const FormatDate = (inputDate: Date) => {
  const dateObj = new Date(inputDate);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formattedDateArray = new Intl.DateTimeFormat(
    "en-CA",
    options
  ).formatToParts(dateObj);
  const year = formattedDateArray.find((entry) => entry.type === "year")?.value;
  const month = formattedDateArray
    .find((entry) => entry.type === "month")
    ?.value.padStart(2, "0");
  const day = formattedDateArray
    .find((entry) => entry.type === "day")
    ?.value.padStart(2, "0");
  const hour = formattedDateArray
    .find((entry) => entry.type === "hour")
    ?.value.padStart(2, "0");
  const minute = formattedDateArray
    .find((entry) => entry.type === "minute")
    ?.value.padStart(2, "0");
  return `${year}-${month}-${day} ${hour}-${minute}`;
};
