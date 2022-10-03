import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import EssentialDataContext from "./contexts/EssentialDataContext";
import XMLContext from "./contexts/XMLContext";
import UpdateParagraphContext from "./contexts/UpdateParagraphContext";
import useLocalStorage from "./hooks/useLocalStorage";

const Root = () => {
  const [value, setValue] = useLocalStorage({
    isDarkMode: false,
    fontSize: 2,
    openTooltip: true,
    showClaimElementKey: true,
    synchronizeHighlight: false,
    readingModePureText: false,
    useDatabase: false
  });

  return (
    <XMLContext>
      <EssentialDataContext personalSettings={value}>
        <UpdateParagraphContext>
          <App setLocalStorageValue={setValue} />
        </UpdateParagraphContext>
      </EssentialDataContext>
    </XMLContext>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  rootElement
);
