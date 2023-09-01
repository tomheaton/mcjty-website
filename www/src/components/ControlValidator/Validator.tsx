import React, {type FormEvent, useState} from "react";
import styles from "./styles.module.css";
import {DATA, type MinecraftVersion, type ValidatorType} from "./data";
import {type ZodIssue} from "zod";

type Props = {
    type: ValidatorType;
    version: MinecraftVersion;
};

function formatErrorLine(item: ZodIssue) {
    console.log(item);
    if (item.message === 'Invalid input') {
        return (
            "Rule " +
            (parseInt(item.path[0].toString()) + 1) +
            ": Expected " +
            item.path[2] +
            " in " +
            item.path[1]
        );
    }
    if (item.message === 'Required') {
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

    const [error, setError] = useState<{ error: ZodIssue, color: string }[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [validating, setValidating] = useState<boolean>(false);

    const handleValidation = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("validating...");

        setValidating(true);
        setError(null);
        setSuccess(null);

        try {
            const json = JSON.parse(text);
            setText(JSON.stringify(json, null, 2));

            const result = schema.safeParse(json);
            if (result.success === false) {
                console.log("invalid!");

                const output = result.error.issues
                    .map((item) => ({
                        error: item,
                        color: item.message.startsWith("Warning:") ? "orange" : "red"
                    }));

                setError(output);
            } else {
                console.log("valid!");
                // @ts-ignore
                console.log(result.data);

                setSuccess("Valid!");
            }
        } catch (e) {
            setError(e.message);
        }

        setValidating(false);
    };

    return (
        <form onSubmit={handleValidation} className={styles.form}>
            {/* TODO: add syntax highlighting */}
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Enter ${props.type} schema`}
                required
                style={{fontFamily: "monospace", width: "100%", height: "400px"}}
            />
            <br/>
            <button
                type="submit"
                className="button button--primary button--lg"
                disabled={validating}
            >
                {validating ? "Validating..." : "Validate"}
            </button>
            {error && (
                <>
                    <br />
                    <pre>
            {error.map((item, index) => (
                <span key={index} style={{ color: item.color }}>
                {formatErrorLine(item.error)}{"\n"}
              </span>
            ))}
          </pre>
                </>
            )}
            {success && (
                <>
                    <br/>
                    <p>Success</p>
                </>
            )}
        </form>
    );
};

export default Validator;
