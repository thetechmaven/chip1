export function isXLink(message: string): boolean {
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?(x\.com|twitter\.com)\/[^\s]+/i;
  return urlPattern.test(message);
}
