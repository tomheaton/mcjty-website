import { permanentRedirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ title: string | undefined }>;
}) {
  const { title } = await searchParams;

  const redirectUrl = getRedirectUrl(title);

  return permanentRedirect(redirectUrl);
}

function getRedirectUrl(title: string | undefined): string {
  if (!title) {
    return "https://mcjty.eu/docs/mods/";
  }

  switch (title) {
    case "Ariente":
      return "https://mcjty.eu/docs/mods/ariente/";
    case "ControlMods":
    case "ControlMods16":
    case "FxControl":
    case "InControl":
      return "https://mcjty.eu/docs/mods/control-mods/";
    case "Deep_Resonance":
      return "https://mcjty.eu/docs/mods/deep-resonance/";
    case "EFab":
      return "https://mcjty.eu/docs/mods/efab/";
    case "Elemental_Dimensions":
      return "https://mcjty.eu/docs/mods/elemental-dimensions/";
    case "Enigma":
      return "https://mcjty.eu/docs/mods/enigma/";
    case "Interaction_Wheel":
      return "https://mcjty.eu/docs/mods/interaction-wheel/";
    case "Lost_Cities":
      return "https://mcjty.eu/docs/mods/lost-cities/";
    case "Quest_Utilities":
      return "https://mcjty.eu/docs/mods/quest-utilities/";
    case "RFTools":
      return "https://mcjty.eu/docs/mods/rftools/";
    case "RFTools_Control":
      return "https://mcjty.eu/docs/mods/rftools-control/";
    case "RFTools_Dimensions":
      return "https://mcjty.eu/docs/mods/rftools-dimensions/";
    case "Struggle_Mod_List":
      return "https://mcjty.eu/docs/mods/struggle-mod-list/";
    case "The_One_Probe":
      return "https://mcjty.eu/docs/mods/the-one-probe/";
    case "XNet":
      return "https://mcjty.eu/docs/mods/xnet/";
    default:
      return "https://mcjty.eu/docs/mods/";
  }
}
