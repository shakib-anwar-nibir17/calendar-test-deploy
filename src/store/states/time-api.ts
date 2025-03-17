export type TimeZoneApiResponse = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  seconds: number;
  milliSeconds: number;
  dateTime: string;
  date: string;
  time: string;
  timeZone: string;
  dayOfWeek: string;
  dstActive: boolean;
};

export type TimezoneRequest = {
  fromTimeZone: string;
  dateTime: string;
  toTimeZone: string;
  dstAmbiguity: string;
};

export type TimeZoneConversionApiResponse = {
  fromTimezone: string;
  fromDateTime: string;
  toTimeZone: string;
  conversionResult: TimeZoneApiResponse;
};
