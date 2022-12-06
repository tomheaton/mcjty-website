import type {NextPage} from "next";
import Head from "next/head";
import styles from "../../styles/Index.module.css";
import {useRouter} from "next/router";
import Link from "next/link";
import {useEffect} from "react";

const Modding: NextPage = () => {
  // TODO: use middleware instead
  const router = useRouter();

  const query = router.query;

  useEffect(() => {
    // TODO: title.toLowerCase()
    if (query.title) {
      switch (query.title) {
        case "YouTube-Tutorials-12":
          router.push("https://mcjty.eu/docs/1.12/");
          break;
        case "YouTube-Tutorials-15":
          router.push("https://mcjty.eu/docs/1.15/");
          break;
        case "YouTube-Tutorials": case "YouTube-Tutorials-14": case "YouTube-Tutorials-16":
          router.push("https://mcjty.eu/docs/1.14-1.15-1.16/");
          break;
        case "YouTube-Tutorials-17":
          router.push("https://mcjty.eu/docs/1.17/");
          break;
        case "YouTube-Tutorials-18":
          router.push("https://mcjty.eu/docs/1.18/");
          break;
        case "YouTube-Tutorials-19":
          router.push("https://mcjty.eu/docs/1.19/");
          break;
        default:
          router.push("https://mcjty.eu/docs/intro/");
          break;
      }
    } else {
      router.push("https://mcjty.eu/docs/intro/");
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
        <h1 className={styles.title}>
          Modding - McJty Redirector
        </h1>

        <Link href={"https://www.mcjty.eu/"}>
          <p className={styles.description}>
            Redirect to the new site!
          </p>
        </Link>

        <p>
          {JSON.stringify(query, null, 2)}
        </p>
      </main>
    </div>
  );
};

export default Modding;
