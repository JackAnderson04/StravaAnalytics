// utils/formatters.ts
export const formatTime = (seconds: number) => {
    if (seconds === Number.MAX_VALUE || seconds === null) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  export const formatDistance = (meters: number) => {
    // Convert to miles instead of kilometers
    const miles = meters * 0.000621371;
    if (miles >= 0.1) {
      return `${miles.toFixed(1)} mi`;
    }
    // For very short segments, show feet
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  };