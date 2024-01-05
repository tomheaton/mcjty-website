import type { NextPage } from "next";
import Head from "next/head";
import styles from "@/styles/Index.module.css";
import Link from "next/link";

const Index: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>McJty Redirector</title>
        <meta name="description" content="McJty Redirector" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>McJty Redirector</h1>

        <Link href={"https://www.mcjty.eu/"}>
          <p className={styles.description}>Redirect to the new site!</p>
        </Link>
      </main>
    </div>
  );
};

export default Index;
