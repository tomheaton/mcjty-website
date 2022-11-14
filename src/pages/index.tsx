import React from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import ModWidgets from "@site/src/components/ModWidgets";
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();

    return (
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <h1 className="hero__title">
                    {siteConfig.title}
                </h1>
                <p className="hero__subtitle">
                    {siteConfig.tagline}
                </p>
                {/*<div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>*/}
            </div>
        </header>
    );
}

export default function Home(): JSX.Element {
    const {siteConfig} = useDocusaurusContext();

    return (
        <Layout
            title={`${siteConfig.title}`}
            description="Description will go into a meta tag in <head />"
        >
            <HomepageHeader/>
            <main>
                {/*<HomepageFeatures />*/}
                <div className={styles.mcjtyInfo}>
                    <img src={require("@site/static/img/mcjty.png").default} alt={"mcjty logo"}/>
                    <p>
                        Hello, I'm McJty.
                        I'm a Minecraft mod <strong>developer, modpack developer</strong> and <strong>YouTuber!</strong>
                        <br/>
                        I've made several mods for your and my pleasure and also like to help out other members in the
                        community.
                        <br/>
                        I'm also a member of the popular server group <strong>ForgeCraft</strong>.
                    </p>
                </div>
                <ModWidgets/>
            </main>
        </Layout>
    );
}
