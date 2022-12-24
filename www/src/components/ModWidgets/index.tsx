import React, {useEffect, useState} from "react";
import styles from "./styles.module.css";

const ModWidget: React.FC<{ id: number }> = ({id}) => {
  // TODO: fix mobile styling
  return (
    <iframe
      src={`https://www.cfwidget.com/${id}`}
      width={"100%"}
      style={{border: "none"}}
      scrolling={"no"}
    />
  );
};

const ModWidgets: React.FC = () => {
  const [mods, setMods] = useState<number[]>([]);

  useEffect(() => {
    fetch("https://api.cfwidget.com/author/search/mcjty")
      .then(res => res.json())
      .then(data => setMods(data.projects?.map(m => m?.id)));
  }, []);

  return (
    <section className={styles.container}>
      <h2>
        Mods
      </h2>
      <div className={styles.modWidgetContainer}>
        {mods.map((id) => <ModWidget key={id} id={id}/>)}
      </div>
    </section>
  );
};

export default ModWidgets;
