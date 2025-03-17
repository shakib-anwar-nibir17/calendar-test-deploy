export function convertToHoursMinutes(timeFloat: number) {
  const hours = Math.floor(timeFloat);
  const minutes = Math.round((timeFloat - hours) * 60);
  return { hours, minutes };
}
