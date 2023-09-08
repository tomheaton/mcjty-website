import React, { type FormEvent, useState } from "react";
import { DATA, type MinecraftVersion, type ValidatorType } from "./data";
import JSONParser from "@site/src/components/ControlValidator/jsonParser";
import { formatErrorLine } from "@site/src/components/ControlValidator/utils";

type Props = {
  type: ValidatorType;
  version: MinecraftVersion;
  text: string;
  setText: (text: string) => void;
};

// TODO: add syntax highlighting
const Validator: React.FC<Props> = (props) => {
  const schema = DATA[props.version][props.type];

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
    setParseError("");
    setZodErrors([]);
    setSuccess(false);

    try {
      // const json = JSON.parse(props.text);
      const json = new JSONParser(props.text).parse();

      props.setText(JSON.stringify(json, null, 2));

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

        props.setText(JSON.stringify(result.data, null, 2));
        props.setText(JSON.stringify(json, null, 2));

        setSuccess(true);
      }
    } catch (e) {
      console.log("Invalid: Parse Error!");

      setParseError(e.message);
    }

    setValidating(false);
  };

  return (
    <form
      onSubmit={handleValidation}
      className="w-full flex justify-center gap-y-4 gap-x-4 h-full md:flex-row flex-col"
    >
      {/* TODO: add syntax highlighting */}
      <div className="w-full">
        <textarea
          value={props.text}
          onChange={(e) => props.setText(e.target.value)}
          placeholder={`Enter ${props.type} schema for ${props.version} here...`}
          required
          className="w-full h-[400px] font-mono rounded p-2"
        />
      </div>
      <div className="w-full flex justify-center h-full flex-col">
        <button
          type="submit"
          className="button button--primary button--lg"
          disabled={validating}
        >
          {validating ? "Validating..." : "Validate"}
        </button>
        <br />
        {parseError && (
          <pre className="whitespace-pre-wrap w-full">
            <span style={{ color: "red" }}>{parseError}</span>
          </pre>
        )}
        {zodErrors.length > 0 && (
          <pre className="whitespace-pre-wrap w-full">
            {zodErrors.map((error, index) => (
              <span key={index} style={{ color: error.color }}>
                {error.message}
                {"\n"}
              </span>
            ))}
          </pre>
        )}
        {success && (
          <pre className="whitespace-pre-wrap w-full">
            <span style={{ color: "green" }}>Success!</span>
          </pre>
        )}
      </div>
    </form>
  );
};

export default Validator;
