export const formatInstagamUrl = (url: string) => {
  const regex =
    /^(?:@|(?:https?:\/\/)?(?:www\.)?instagr(?:\.am|am\.com)\/)?([\w\.]+)\/?$/g;

  return regex.exec(url)?.[1];
};

export const formatFacebookUrl = (url: string) => {
  const regex =
    /^(?:@|(?:https?:\/\/)?(?:www\.)?facebook\.com\/)?([\w\.]+)\/?$/g;

  return regex.exec(url)?.[1];
};

export const formatTwitterUrl = (url: string) => {
  const regex = /(?:https?:\/\/)?(?:www\.)?x\.com\/([A-Za-z0-9_]+)/;

  return regex.exec(url)?.[1];
};

export function extractDomain(url: string | URL) {
  // Ensure the URL has a protocol, add "http://" if missing
  const formattedUrl = typeof url === "string" && !/^https?:\/\//i.test(url)
    ? `http://${url}`
    : url;

  const parsedUrl = new URL(formattedUrl);
  const hostname = parsedUrl.hostname;

  const domain = hostname.startsWith("www.") ? hostname.slice(4) : hostname;

  return domain;
}
