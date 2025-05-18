import { permanentRedirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ title: string | undefined }>;
}) {
  const title = (await searchParams).title;

  const redirectUrl = getRedirectUrl(title);

  return permanentRedirect(redirectUrl);
}

function getRedirectUrl(title: string | undefined): string {
  if (!title) {
    return "https://mcjty.eu/docs/intro/";
  }

  switch (title) {
    case "YouTube-Tutorials-12":
      return "https://mcjty.eu/docs/1.12/";
    case "YouTube-Tutorials-15":
      return "https://mcjty.eu/docs/1.15/";
    case "YouTube-Tutorials":
    case "YouTube-Tutorials-14":
    case "YouTube-Tutorials-16":
      return "https://mcjty.eu/docs/1.14-1.15-1.16/";
    case "YouTube-Tutorials-17":
      return "https://mcjty.eu/docs/1.17/";
    case "YouTube-Tutorials-18":
      return "https://mcjty.eu/docs/1.18/";
    case "YouTube-Tutorials-19":
      return "https://mcjty.eu/docs/1.19/";
    default:
      return "https://mcjty.eu/docs/intro/";
  }
}
