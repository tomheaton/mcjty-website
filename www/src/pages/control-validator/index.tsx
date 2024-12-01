import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import ControlValidator from "@site/src/components/ControlValidator";
import Layout from "@theme/Layout";

const ControlValidatorPage: React.FC = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className="p-4">
        <div style={{ width: "100%" }}>
          <h1>Control Validator</h1>
          <p>
            This tool allows you to validate your In Control files. It will
            check for common mistakes and errors.
          </p>
        </div>
        <ControlValidator />
      </main>
    </Layout>
  );
};

export default ControlValidatorPage;
