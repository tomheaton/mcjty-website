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

// TODO: add syntax highlighting
const ControlValidator: React.FC<Props> = ({}) => {
  const [version, setVersion] = useState<MinecraftVersion>("1.20");
  const [tab, setTab] = useState<ValidatorType | null>(
    // TODO: clean this mess up
    Object.keys(DATA[version]).map((v) => v as ValidatorType)[0],
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
      <div
        // style={{
        //   width: "60%",
        //   display: "flex ",
        //   paddingLeft: "60px",
        //   margin: "0 auto",
        // }}
        className="flex flex-col sm:flex-row p-4 w-1/2 mx-auto gap-x-8"
      >
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
        <ul
          className="tabs tabs--block w-full"
          // style={{ width: "100%", paddingLeft: "60px" }}
        >
          {Object.keys(DATA[version]).map((validator) => (
            <li
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
      <div
        // style={{
        //   width: "60%",
        //   margin: "0 auto",
        //   display: "flex",
        //   flexDirection: "column",
        // }}
        className="sm:w-1/2 mx-auto"
      >
        <Validator type={tab as ValidatorType} version={version} />
        {/*{Object.keys(DATA[version]).map((validator) => (
          <Validator
            key={validator}
            type={validator as ValidatorType}
            version={version}
          />
        ))}*/}
        {Object.keys(DATA[version]).length === 0 && (
          <p>No validators for this version!</p>
        )}
      </div>
    </div>
  );
};

export default ControlValidator;
