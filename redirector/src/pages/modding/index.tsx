import type {NextPage} from 'next';
import Head from 'next/head';
import styles from '../../styles/Index.module.css';

const Index: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>McJty Redirector</title>
        <meta name="description" content="Generated by create next app"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          McJty Redirector
        </h1>

        <p className={styles.description}>
          Redirecting you to the new wiki!
        </p>
      </main>
    </div>
  );
}

export default Index;
