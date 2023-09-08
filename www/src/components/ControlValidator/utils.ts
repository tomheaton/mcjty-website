import { type ZodIssue } from "zod";

export function formatErrorLine(item: ZodIssue) {
  console.log(item);

  // TODO: check this doesn't break anything
  if (item.path.length === 0) {
    return item.message;
  }

  if (item.message === "Invalid input") {
    return (
      "Rule " +
      (parseInt(item.path[0].toString()) + 1) +
      ": Expected " +
      item.path[2] +
      " in " +
      item.path[1]
    );
  }

  if (item.message === "Required") {
    return (
      "Rule " +
      (parseInt(item.path[0].toString()) + 1) +
      ": Expected " +
      item.path[1] +
      " with values " +
      // @ts-ignore
      item.expected
    );
  }

  return (
    "Rule " + (parseInt(item.path[0].toString()) + 1) + ": " + item.message
  );
}

export function parseJSONWithDuplicateKeys(jsonString: string) {
  const seenKeys = new Set();

  return JSON.parse(jsonString, (key, value) => {
    if (seenKeys.has(key)) {
      throw new Error("Duplicate key: " + key);
    }
    seenKeys.add(key);
    return value;
  });
}
