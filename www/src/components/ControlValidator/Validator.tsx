import React, { type FormEvent, useState } from "react";
import styles from "./styles.module.css";
import { DATA, type MinecraftVersion, type ValidatorType } from "./data";
import { type ZodIssue } from "zod";

type Props = {
  type: ValidatorType;
  version: MinecraftVersion;
};

function formatErrorLine(item: ZodIssue) {
  console.log(item);

  // TODO: check this doesn't break anything
  if (item.path.length === 0) {
    return item.message;
  }

  if (item.message === "Invalid input") {
    return (
      "Rule " +
      (parseInt(item.path[0].toString()) + 1) +
      ": Expected " +
      item.path[2] +
      " in " +
      item.path[1]
    );
  }

  if (item.message === "Required") {
    return (
      "Rule " +
      (parseInt(item.path[0].toString()) + 1) +
      ": Expected " +
      item.path[1] +
      " with values " +
      // @ts-ignore
      item.expected
    );
  }

  return (
    "Rule " + (parseInt(item.path[0].toString()) + 1) + ": " + item.message
  );
}

// TODO: add syntax highlighting
const Validator: React.FC<Props> = (props) => {
  const schema = DATA[props.version][props.type];

  const [text, setText] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const [zodErrors, setZodErrors] = useState<
    { message: string; color: string }[]
  >([]);
  const [success, setSuccess] = useState<boolean>(null);
  const [validating, setValidating] = useState<boolean>(false);

  const handleValidation = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Validating...");

    setValidating(true);
    setZodErrors([]);
    setSuccess(false);

    try {
      const json = JSON.parse(text);

      setText(JSON.stringify(json, null, 2));

      const result = schema.safeParse(json);

      if (result.success === false) {
        console.log("Invalid: Zod Error!");

        const output = result.error.issues.map((error) => ({
          message: formatErrorLine(error),
          color: error.message.startsWith("Warning:") ? "orange" : "red",
        }));

        console.log(output);

        setZodErrors(output);
      } else {
        console.log("Valid!");

        setText(JSON.stringify(result.data, null, 2));

        setSuccess(true);
      }
    } catch (e) {
      console.log("Invalid: Parse Error!");

      setParseError(e.message);
    }

    setValidating(false);
  };

  return (
    <form onSubmit={handleValidation} className={styles.form}>
      {/* TODO: add syntax highlighting */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Enter ${props.type} schema for ${props.version} here...`}
        required
        style={{ fontFamily: "monospace", width: "100%", height: "400px" }}
      />
      <br />
      <br />
      <button
        type="submit"
        className="button button--primary button--lg"
        disabled={validating}
      >
        {validating ? "Validating..." : "Validate"}
      </button>
      <br />
      <br />
      {parseError && (
        <pre>
          <span style={{ color: "red" }}>{parseError}</span>
        </pre>
      )}
      {zodErrors.length > 0 && (
        <pre>
          {zodErrors.map((error, index) => (
            <span key={index} style={{ color: error.color }}>
              {error.message}
              {"\n"}
            </span>
          ))}
        </pre>
      )}
      {success && (
        <pre>
          <span style={{ color: "green" }}>Success!</span>
        </pre>
      )}
    </form>
  );
};

export default Validator;
