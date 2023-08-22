export function parseDate(dateString: string, shortYear = false) {
  const parts = dateString.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is zero-based
  const year = parseInt(parts[2], 10); // Assuming year is between 2000-2099
  return new Date(shortYear ? year + 2000 : year, month, day);
}

export function parseDateTime(dateTimeString: string) {
  const parts = dateTimeString.split(" ");
  const date = parseDate(parts[0]);
  if (parts.length === 1) return date;
  const time = parts[1];
  return new Date(`${date.toDateString()} ${time}`);
}
