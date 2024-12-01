import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ModWidgets from "@site/src/components/ModWidgets";
import Layout from "@theme/Layout";
import clsx from "clsx";
import styles from "./styles.module.css";

const HomepageHeader: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title" style={{ color: "white" }}>
          {siteConfig.title}
        </h1>
        <p className="hero__subtitle" style={{ color: "white" }}>
          {siteConfig.tagline}
        </p>
      </div>
    </header>
  );
};

const Home: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main>
        <div className={styles.mcjtyInfo}>
          <img
            src={require("@site/static/img/mcjty.png").default}
            alt="McJty Logo"
          />
          <p className={styles.text}>
            Hello, I'm McJty. I'm a Minecraft mod{" "}
            <strong>developer, modpack developer</strong> and{" "}
            <strong>YouTuber!</strong>
            <br />
            I've made several mods for your and my pleasure and also like to
            help out other members in the community.
            <br />
            I'm also a member of the popular server group{" "}
            <strong>ForgeCraft</strong>.
          </p>
        </div>
        <ModWidgets />
        <div className={styles.infoBox}>
          <p className={styles.text} style={{ textAlign: "center" }}>
            Want to support what I do?
          </p>
          <Link href="https://www.patreon.com/McJty">
            <img
              src={require("@site/static/img/patreon.png").default}
              alt="McJty Patreon badge"
            />
          </Link>
        </div>
        <div className={styles.infoBox}>
          <p className={styles.text} style={{ textAlign: "center" }}>
            Did you know McJty&apos;s son makes mods too?
          </p>
          <Link
            className="button button--primary button--lg"
            href="https://www.curseforge.com/members/romelo333/projects"
          >
            Romelo's Mods
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
