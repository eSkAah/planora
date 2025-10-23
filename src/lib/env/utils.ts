export function removeTrailingSlash(url: string): string {
  if (url.length <= 1) {
    return url;
  }
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export function hasPlaceholderValue(value: string | undefined | null): boolean {
  if (!value) {
    return false;
  }
  const normalised = value.toLowerCase();
  return (
    normalised.includes('your_') ||
    normalised.includes('xxx') ||
    normalised.includes('your-project-id')
  );
}
