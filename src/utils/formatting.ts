export const getRouteKey = (source: string, destination: string) =>
  `${source} to ${destination}`;

export const getStatusEmoji = (success: number, failure: number) => {
  if (success === 0 && failure === 0) return "❓";
  if (success > 0 && failure === 0) return "✅";
  if (success === 0 && failure > 0) return "❌";
  return "⚠️";
};

export const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
}; 