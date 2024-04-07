import styles from "@/styles/Index.module.css";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Mods() {
  // TODO: use middleware instead
  const router = useRouter();

  const query = router.query;

  useEffect(() => {
    // TODO: title.toLowerCase()
    if (query.title) {
      switch (query.title) {
        case "Ariente":
          router.push("https://mcjty.eu/docs/mods/ariente/");
          break;
        case "ControlMods":
        case "ControlMods16":
        case "FxControl":
        case "InControl":
          router.push("https://mcjty.eu/docs/mods/control-mods/");
          break;
        case "Deep_Resonance":
          router.push("https://mcjty.eu/docs/mods/deep-resonance/");
          break;
        case "EFab":
          router.push("https://mcjty.eu/docs/mods/efab/");
          break;
        case "Elemental_Dimensions":
          router.push("https://mcjty.eu/docs/mods/elemental-dimensions/");
          break;
        case "Enigma":
          router.push("https://mcjty.eu/docs/mods/enigma/");
          break;
        case "Interaction_Wheel":
          router.push("https://mcjty.eu/docs/mods/interaction-wheel/");
          break;
        case "Lost_Cities":
          router.push("https://mcjty.eu/docs/mods/lost-cities/");
          break;
        case "Quest_Utilities":
          router.push("https://mcjty.eu/docs/mods/quest-utilities/");
          break;
        case "RFTools":
          router.push("https://mcjty.eu/docs/mods/rftools/");
          break;
        case "RFTools_Control":
          router.push("https://mcjty.eu/docs/mods/rftools-control/");
          break;
        case "RFTools_Dimensions":
          router.push("https://mcjty.eu/docs/mods/rftools-dimensions/");
          break;
        case "Struggle_Mod_List":
          router.push("https://mcjty.eu/docs/mods/struggle-mod-list/");
          break;
        case "The_One_Probe":
          router.push("https://mcjty.eu/docs/mods/the-one-probe/");
          break;
        case "XNet":
          router.push("https://mcjty.eu/docs/mods/xnet/");
          break;
        default:
          router.push("https://mcjty.eu/docs/mods/");
          break;
      }
    } else {
      router.push("https://mcjty.eu/docs/mods/");
    }
  }, [query]);

  return (
    <div className={styles.container}>
      <Head>
        <title>McJty Redirector</title>
        <meta name="description" content="McJty Redirector" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Mods - McJty Redirector</h1>

        <Link href={"https://www.mcjty.eu/"}>
          <p className={styles.description}>Redirect to the new site!</p>
        </Link>

        <p>{JSON.stringify(query, null, 2)}</p>
      </main>
    </div>
  );
}
