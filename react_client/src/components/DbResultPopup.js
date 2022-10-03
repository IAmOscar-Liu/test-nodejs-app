import React, { useContext } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";

const DbResultPopup = ({ handleClose }) => {
  const [{ dbResultMap }] = useContext(EssentialDataContextProvider);

  return (
    <div className="db-result-popup">
      <h4>資料庫搜尋結果</h4>
      <div>
        <ul>
          <li>
            <p>原始文字</p>
            <p>請求項</p>
            <p>資料庫搜尋結果</p>
          </li>
          {Object.entries(dbResultMap)
            .map(([key, value]) => ({
              origin: key,
              claims: value.claims,
              dbValue: value.dbValue
            }))
            .sort((a, b) => a.claims[0] - b.claims[0])
            .map(({ origin, claims, dbValue }) => (
              <li
                key={origin}
                style={
                  dbValue === "無結果" ? { color: "red" } : { color: "black" }
                }
              >
                <p>{origin}</p>
                <p>{claims.join("、")}</p>
                <p>{dbValue}</p>
              </li>
            ))}
        </ul>
      </div>
      <button onClick={() => handleClose(false)}>確認</button>
    </div>
  );
};

export default DbResultPopup;
