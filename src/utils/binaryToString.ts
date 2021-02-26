export function binaryToString(buffer: Buffer): string {
  const json = buffer && buffer.toJSON();
  return json && JSON.stringify(json.data);
}
