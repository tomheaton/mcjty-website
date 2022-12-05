import React from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ModWidgets from "@site/src/components/ModWidgets";
import Layout from "@theme/Layout";
import styles from "./index.module.css";
import Link from "@docusaurus/Link";

const HomepageHeader: React.FC = () => {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className={"container"}>
        <h1 className={"hero__title"}>
          {siteConfig.title}
        </h1>
        <p className={"hero__subtitle"}>
          {siteConfig.tagline}
        </p>
        {/*<div className={styles.buttons}>
                    <Link
                        className={"button button--secondary button--lg"}
                        to={"/docs/intro"}
                    >
                        Docusaurus Tutorial - 5min ⏱️
                    </Link>
                </div>*/}
      </div>
    </header>
  );
};

const Home: React.FC = () => {
  const {siteConfig} = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        {/*<HomepageFeatures />*/}
        {/*TODO: fix mobile styling*/}
        <div className={styles.mcjtyInfo}>
          <img src={require("@site/static/img/mcjty.png").default} alt={"McJty Logo"} />
          <p className={styles.text}>
            Hello, I'm McJty.
            I'm a Minecraft mod <strong>developer, modpack developer</strong> and <strong>YouTuber!</strong>
            <br />
            I've made several mods for your and my pleasure and also like to help out other members in the
            community.
            <br />
            I'm also a member of the popular server group <strong>ForgeCraft</strong>.
          </p>
        </div>
        {/*TODO: fix mobile styling*/}
        <ModWidgets />
        {/*TODO: fix mobile styling*/}
        <div className={styles.romeloInfo}>
          <p className={styles.text} style={{textAlign: "center"}}>
            Did you know McJty&apos;s son makes mods too?
          </p>
          <Link
            className={"button button--primary button--lg"}
            href={"https://www.curseforge.com/members/romelo333/projects"}
          >
            Romelo's Mods
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
