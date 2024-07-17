// helperFunctions.tsx
export function formatSubcategoryName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function processData(data: any, setData: Function): string[] {
  if (typeof data === "object" && data !== null) {
    const keys = Object.keys(data);
    setData(data);
    return keys;
  }
  return [];
}
