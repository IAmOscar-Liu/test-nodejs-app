import React, { useContext } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";

/*
handleClose={toggleIsSettingPopupOpen}
*/

const SettingsPopup = ({ setLocalStorageValue, handleClose }) => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const radioLists = ["極大", "大", "中", "小", "極小"];

  return (
    <div className="setting-popup">
      <h4>個人喜好設定</h4>
      <div>
        <p>
          日夜模式：
          <label>
            <input
              type="radio"
              name="light-dark"
              checked={!essentialData.personalSettings.isDarkMode}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    isDarkMode: false
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  isDarkMode: false
                });
              }}
            />
            日&nbsp;&nbsp;
          </label>
          <label>
            <input
              type="radio"
              name="light-dark"
              checked={essentialData.personalSettings.isDarkMode}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    isDarkMode: true
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  isDarkMode: true
                });
              }}
            />
            夜&nbsp;&nbsp;
          </label>
        </p>
        <p>
          文字大小：
          {radioLists.map((radioList, idx) => (
            <label key={idx}>
              <input
                type="radio"
                name="font-size"
                checked={essentialData.personalSettings.fontSize === idx}
                onChange={() => {
                  switch (idx) {
                    case 0:
                      document.querySelector(".App").style.fontSize = "1.2em";
                      break;
                    case 1:
                      document.querySelector(".App").style.fontSize = "1.1em";
                      break;
                    case 2:
                      document.querySelector(".App").style.fontSize = "1em";
                      break;
                    case 3:
                      document.querySelector(".App").style.fontSize = "0.9em";
                      break;
                    default:
                      document.querySelector(".App").style.fontSize = "0.8em";
                      break;
                  }
                  setEssentialData((prev) => ({
                    ...prev,
                    personalSettings: {
                      ...prev.personalSettings,
                      fontSize: idx
                    }
                  }));
                  setLocalStorageValue({
                    ...essentialData.personalSettings,
                    fontSize: idx
                  });
                }}
              />
              {radioList}&nbsp;&nbsp;
            </label>
          ))}
        </p>
        <p>
          請求項開啟提示工具(tooltip)：
          <label>
            <input
              type="radio"
              name="open-tooltip"
              checked={essentialData.personalSettings.openTooltip}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    openTooltip: true
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  openTooltip: true
                });
              }}
            />
            是&nbsp;&nbsp;
          </label>
          <label>
            <input
              type="radio"
              name="open-tooltip"
              checked={!essentialData.personalSettings.openTooltip}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    openTooltip: false
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  openTooltip: false
                });
              }}
            />
            否&nbsp;&nbsp;
          </label>
        </p>
        <p>
          請求項元件顯示對應符號：
          <label>
            <input
              type="radio"
              name="show-symbol"
              checked={essentialData.personalSettings.showClaimElementKey}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    showClaimElementKey: true
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  showClaimElementKey: true
                });
              }}
            />
            是&nbsp;&nbsp;
          </label>
          <label>
            <input
              type="radio"
              name="show-symbol"
              checked={!essentialData.personalSettings.showClaimElementKey}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    showClaimElementKey: false
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  showClaimElementKey: false
                });
              }}
            />
            否&nbsp;&nbsp;
          </label>
        </p>
        <p>
          說明書、申請專利範圍之所有構件皆同步標註(highlight)：
          <label>
            <input
              type="radio"
              name="symbol-sync"
              checked={essentialData.personalSettings.synchronizeHighlight}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    synchronizeHighlight: true
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  synchronizeHighlight: true
                });
              }}
            />
            是&nbsp;&nbsp;
          </label>
          <label>
            <input
              type="radio"
              name="symbol-sync"
              checked={!essentialData.personalSettings.synchronizeHighlight}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    synchronizeHighlight: false
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  synchronizeHighlight: false
                });
              }}
            />
            否&nbsp;&nbsp;
          </label>
        </p>
        <p>
          閱讀模式啟用純文字模式(取消構件標註「highlight」功能)：
          <label>
            <input
              type="radio"
              name="pure-text"
              checked={essentialData.personalSettings.readingModePureText}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    readingModePureText: true
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  readingModePureText: true
                });
              }}
            />
            是&nbsp;&nbsp;
          </label>
          <label>
            <input
              type="radio"
              name="pure-text"
              checked={!essentialData.personalSettings.readingModePureText}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    readingModePureText: false
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  readingModePureText: false
                });
              }}
            />
            否&nbsp;&nbsp;
          </label>
        </p>
        <p>
          連接資料庫來尋找請求項的構件(須有網路連線，且無法在本機上使用)：
          <label>
            <input
              type="radio"
              name="use-db"
              checked={essentialData.personalSettings.useDatabase}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    useDatabase: true
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  useDatabase: true
                });
              }}
            />
            是&nbsp;&nbsp;
          </label>
          <label>
            <input
              type="radio"
              name="use-db"
              checked={!essentialData.personalSettings.useDatabase}
              onChange={() => {
                setEssentialData((prev) => ({
                  ...prev,
                  personalSettings: {
                    ...prev.personalSettings,
                    useDatabase: false
                  }
                }));
                setLocalStorageValue({
                  ...essentialData.personalSettings,
                  useDatabase: false
                });
              }}
            />
            否&nbsp;&nbsp;
          </label>
        </p>
      </div>
      <button onClick={() => handleClose(false)}>確認</button>
    </div>
  );
};

export default SettingsPopup;

/*
    personalSettings: {
      fontSize: 2
      readingModePureText
    }
    readingModePureText
*/
