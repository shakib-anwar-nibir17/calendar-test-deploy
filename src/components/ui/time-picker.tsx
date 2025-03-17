import { useState, useEffect, useCallback } from "react";

interface TimePickerProps {
  initialTime?: string; // Expected format: "2025-03-13T06:00:00.000Z"
  onTimeChange?: (isoTime: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  initialTime,
  onTimeChange,
}) => {
  // Get user's timezone offset in minutes
  const timezoneOffset = new Date().getTimezoneOffset();

  // Convert ISO to local time (preserve date)
  const formatLocalTime = useCallback(
    (isoString: string) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      const localDate = new Date(date.getTime() - timezoneOffset * 60000); // Adjust to local time
      return localDate.toISOString().slice(11, 16); // Extract "HH:MM"
    },
    [timezoneOffset]
  );

  // Convert "HH:MM" back to ISO while keeping the original date
  const toISOTime = (timeStr: string, originalISO: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const originalDate = new Date(originalISO);

    // Set new time but keep original date
    originalDate.setHours(hours, minutes, 0, 0);

    return originalDate.toISOString(); // Preserve date & return correct ISO format
  };

  // Initialize with formatted local time
  const [time, setTime] = useState(
    initialTime
      ? formatLocalTime(initialTime)
      : formatLocalTime(new Date().toISOString())
  );

  useEffect(() => {
    if (initialTime) {
      setTime(formatLocalTime(initialTime)); // Update state if initial time changes
    }
  }, [initialTime, formatLocalTime]);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    if (onTimeChange && initialTime) {
      onTimeChange(toISOTime(newTime, initialTime)); // Preserve date when updating ISO time
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-gray-700">
        Select Time (Auto Timezone)
      </label>
      <input
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="p-2 border rounded-md"
      />
    </div>
  );
};

export default TimePicker;
