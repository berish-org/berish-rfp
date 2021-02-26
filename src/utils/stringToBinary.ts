export function stringToBinary(jsonData: string): Buffer {
  try {
    const json: number[] = jsonData && JSON.parse(jsonData);
    return json && Buffer.from(json);
  } catch (err) {
    return null;
  }
}
