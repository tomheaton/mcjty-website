import React, { useEffect, useState } from "react";
import z from "zod";
import Validator from "./Validator";
import {
  DATA,
  type MinecraftVersion,
  type ValidatorType,
} from "@site/src/components/ControlValidator/data";
import clsx from "clsx";

type Props = {
  schema?: z.ZodSchema<any>;
};

const ControlValidator: React.FC<Props> = ({}) => {
  const [version, setVersion] = useState<MinecraftVersion>("1.20");
  const [tab, setTab] = useState<ValidatorType | null>(
    // TODO: clean this mess up
    Object.keys(DATA[version]).map((v) => v as ValidatorType)[0],
  );
  const [text, setText] = useState<{
    [key in ValidatorType]: string;
  }>(
    Object.keys(DATA[version]).reduce((acc, cur) => {
      acc[cur as ValidatorType] = "";
      return acc;
    }, {} as any),
  );

  useEffect(() => {
    if (Object.keys(DATA[version]).length === 0) {
      setTab(null);
    } else {
      setTab(Object.keys(DATA[version]).map((v) => v as ValidatorType)[0]);
    }
  }, [version]);

  return (
    <div style={{ width: "100%" }}>
      <div className="flex flex-col md:flex-row p-4 w-2/3 mx-auto gap-x-8">
        <select
          value={version}
          onChange={(e) => setVersion(e.target.value as MinecraftVersion)}
          className="button button--primary button--lg"
        >
          {Object.keys(DATA).map((version) => (
            <option
              key={version}
              value={version}
              style={{ backgroundColor: "white", color: "black" }}
            >
              {version}
            </option>
          ))}
        </select>
        <ul className="tabs tabs--block w-full">
          {Object.keys(DATA[version]).map((validator) => (
            <li
              key={validator}
              className={clsx(
                "tabs__item",
                tab === validator && "tabs__item--active",
              )}
              onClick={() => setTab(validator as ValidatorType)}
            >
              {validator}
            </li>
          ))}
        </ul>
      </div>
      <br />
      <div className="md:w-2/3 mx-auto">
        <Validator
          type={tab as ValidatorType}
          version={version}
          text={text[tab as ValidatorType]}
          setText={(text) => {
            setText((prev) => ({ ...prev, [tab as ValidatorType]: text }));
          }}
        />
        {Object.keys(DATA[version]).length === 0 && (
          <p>No validators for this version!</p>
        )}
      </div>
    </div>
  );
};

export default ControlValidator;
