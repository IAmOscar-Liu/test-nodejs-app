import React, { useContext, useState } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";

const DescriptionOfDrawings = () => {
  const [essentialData] = useContext(EssentialDataContextProvider);
  const [isCollapse, setIsCollapse] = useState(false);

  return (
    <section>
      <h2 onClick={() => setIsCollapse((prev) => !prev)}>
        圖式簡單說明{isCollapse ? <span>✛</span> : <span>⤬</span>}
      </h2>
      <div className={`drawing-content ${isCollapse ? "collapse" : ""}`}>
        {essentialData.isProcessing ? (
          <h3>Processing...</h3>
        ) : essentialData.allDrawings.length === 0 ? (
          <h3>No Data passed in yet.</h3>
        ) : essentialData.allDrawings.length === 1 &&
          essentialData.allDrawings[0].fig === "no figs" ? (
          <h2>無法分析圖式簡單說明的內容</h2>
        ) : (
          <>
            <ul>
              <li>
                <span>圖號</span>
                <span>說明</span>
              </li>
              {essentialData.allDrawings.map(
                ({ fig, description, status }, index) =>
                  status === "duplicate" ? (
                    <li
                      key={index}
                      style={{
                        backgroundColor: "rgb(255,0,0)",
                        fontWeight: 700,
                        border: "2px #111 solid"
                      }}
                    >
                      <span>{fig.split("_duplicate_")[0]}</span>
                      <span>{description + "(重複)"}</span>
                    </li>
                  ) : (
                    <li
                      key={index}
                      style={{ backgroundColor: "rgb(147, 173, 100)" }}
                    >
                      <span>{fig}</span>
                      <span>{description}</span>
                    </li>
                  )
              )}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};

export default DescriptionOfDrawings;
