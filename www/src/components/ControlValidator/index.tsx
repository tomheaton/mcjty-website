import React, { useState } from "react";
import z from "zod";
import Validator from "./Validator";
import {
  DATA,
  type MinecraftVersion,
  ValidatorType,
} from "@site/src/components/ControlValidator/data";

type Props = {
  schema?: z.ZodSchema<any>;
};

// TODO: add syntax highlighting
const ControlValidator: React.FC<Props> = ({}) => {
  const [version, setVersion] = useState<MinecraftVersion>("1.20");

  return (
    <div style={{ width: "100%" }}>
      <select
        value={version}
        onChange={(e) => setVersion(e.target.value as MinecraftVersion)}
      >
        {Object.keys(DATA).map((version) => (
          <option key={version} value={version}>
            {version}
          </option>
        ))}
      </select>
      <br />
      <br />
      <div
        style={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Object.keys(DATA[version]).map((validator) => (
          <Validator
            key={validator}
            type={validator as ValidatorType}
            version={version}
          />
        ))}
        {Object.keys(DATA[version]).length === 0 && (
          <p>No validators for this version!</p>
        )}
      </div>
    </div>
  );
};

export default ControlValidator;
