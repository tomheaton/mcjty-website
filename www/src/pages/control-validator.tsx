import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import ControlValidator from "@site/src/components/ControlValidator";

const ControlValidatorPage: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main>
        <h1>Control Validator</h1>
        <br />
        <ControlValidator />
      </main>
    </Layout>
  );
};

export default ControlValidatorPage;
