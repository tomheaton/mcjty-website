import JSONParser from "@site/src/components/ControlValidator/jsonParser";
import { formatErrorLine } from "@site/src/components/ControlValidator/utils";
import { type FormEvent, useState } from "react";
import { DATA, type MinecraftVersion, type ValidatorType } from "./data";

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
      className="flex h-full w-full flex-col justify-center gap-x-4 gap-y-4 md:flex-row"
    >
      {/* TODO: add syntax highlighting */}
      <div className="w-full">
        <textarea
          value={props.text}
          onChange={(e) => props.setText(e.target.value)}
          placeholder={`Enter ${props.type} schema for ${props.version} here...`}
          required
          className="h-[400px] w-full rounded p-2 font-mono"
        />
      </div>
      <div className="flex h-full w-full flex-col justify-center">
        <button
          type="submit"
          className="button button--primary button--lg"
          disabled={validating}
        >
          {validating ? "Validating..." : "Validate"}
        </button>
        <br />
        {parseError && (
          <pre className="w-full whitespace-pre-wrap">
            <span style={{ color: "red" }}>{parseError}</span>
          </pre>
        )}
        {zodErrors.length > 0 && (
          <pre className="w-full whitespace-pre-wrap">
            {zodErrors.map((error, index) => (
              <span key={index} style={{ color: error.color }}>
                {error.message}
                {"\n"}
              </span>
            ))}
          </pre>
        )}
        {success && (
          <pre className="w-full whitespace-pre-wrap">
            <span style={{ color: "green" }}>Success!</span>
          </pre>
        )}
      </div>
    </form>
  );
};

export default Validator;
