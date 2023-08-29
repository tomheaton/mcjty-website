import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import ControlValidator from "@site/src/components/ControlValidator";
import styles from "./styles.module.css";

const ControlValidatorPage: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        <div className={styles.mcjtyInfo}>
          <div style={{ width: "100%" }}>
            <h1>Control Validator</h1>
            <p>
              This tool allows you to validate your control file. It will check
              for common mistakes and
            </p>
          </div>
          <div style={{ width: "100%" }}>
            <ControlValidator />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ControlValidatorPage;
