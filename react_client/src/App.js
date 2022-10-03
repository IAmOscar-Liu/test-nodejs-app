import React, { useContext, useState, useEffect } from "react";
import "./styles.css";
import Dashboard from "./pages/Dashboard";
// import Abstract from "./pages/Abstract";
import Abstract from "./pages/Abstract_v2";
import Disclosure from "./pages/Disclosure";
import ModeForInvention from "./pages/ModeForInvention";
import Claims from "./pages/Claims";
import SimpleClaims from "./pages/SimpleClaims";
import SimpleDescription from "./pages/SimpleDescription";
import SidebarLayout from "./components/SidebarLayout";
import Readme from "./pages/readme";
import Result from "./pages/result";
import { useLoadXML } from "./hooks/loadXML";
import { useInit } from "./hooks/init";
import { XMLContextProvider } from "./contexts/XMLContext";
import { EssentialDataContextProvider } from "./contexts/EssentialDataContext";
import { UpdateParagraphContextProvider } from "./contexts/UpdateParagraphContext";
import { HashRouter as Router, Switch, Route, Link } from "react-router-dom";
import DescriptionOfElement from "./components/DescriptionOfElement";
import FigureOfDrawings from "./components/FigureOfDrawings";
import DescriptionOfDrawings from "./components/DescriptionOfDrawings";
import FailedElements from "./components/FailedElements";
import { reInit } from "./hooks/reInit";
import SettingImg from "./assets/setting.png";
import Popup from "reactjs-popup";
import SettingsPopup from "./components/SettingsPopup";
import DBResultPopup from "./components/DbResultPopup";
import { getPathName } from "./utils/getPathName";

export default function App({ setLocalStorageValue }) {
  const [XMLData, setXMLData] = useContext(XMLContextProvider);
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );

  const {
    setAllUpdateDisclosureParagraph,
    setAllUpdateModeForInventionParagraph,
    setAllUpdateClaimParagraph
  } = useContext(UpdateParagraphContextProvider);

  const [isSettingPopupOpen, toggleIsSettingPopupOpen] = useState(false);
  const [isDBResultPopupOpen, toggleIsDBResultPopupOpen] = useState(false);

  const handleReInit = async (_essentialData, _setEssentialData, _payload) => {
    setAllUpdateDisclosureParagraph([]);
    setAllUpdateModeForInventionParagraph([]);
    setAllUpdateClaimParagraph([]);
    await reInit(_essentialData, _setEssentialData, _payload);
  };

  useLoadXML(XMLData.fileName, XMLData.fileContent, setXMLData);
  // console.log("Call init");
  useInit(
    XMLData,
    setXMLData,
    essentialData,
    setEssentialData,
    setAllUpdateDisclosureParagraph,
    setAllUpdateModeForInventionParagraph,
    setAllUpdateClaimParagraph
  );

  return (
    <div
      className="App"
      style={
        essentialData.pathName === "read-mode"
          ? {
              width: "150%",
              marginLeft: "-50%"
            }
          : {}
      }
    >
      <SidebarLayout>
        <DescriptionOfElement handleReInit={handleReInit} />
        <FigureOfDrawings handleReInit={handleReInit} />
        <DescriptionOfDrawings />
        <FailedElements handleReInit={handleReInit} />
      </SidebarLayout>
      <main
        className={`main ${
          essentialData.personalSettings.isDarkMode ? "dark" : ""
        }`}
      >
        <div>
          <Router>
            <h1 id="main-title">
              <span
                style={
                  essentialData.pathName === "read-mode"
                    ? { display: "none" }
                    : {}
                }
              >
                {" "}
                <Link to="/readme">
                  使用
                  <br />
                  指南
                </Link>
              </span>
              {essentialData.pathName === "read-mode" ? (
                <>
                  <span>
                    <Link to="/">
                      返{"    "}回
                      <br />
                      標準模式
                    </Link>
                  </span>
                  <i
                    onClick={() =>
                      setEssentialData((prev) => ({
                        ...prev,
                        personalSettings: {
                          ...essentialData.personalSettings,
                          readingModePureText: !essentialData.personalSettings
                            .readingModePureText
                        }
                      }))
                    }
                  >
                    {essentialData.personalSettings.readingModePureText
                      ? "互動式"
                      : "純文字"}
                    <br />
                    閱讀
                  </i>
                </>
              ) : (
                <span>
                  <Link to="/read-mode">
                    閱讀
                    <br />
                    模式
                  </Link>
                </span>
              )}
              <img
                onClick={() => toggleIsSettingPopupOpen(true)}
                className="setting-icon"
                src={SettingImg}
                alt=""
              />
              {essentialData.dbResultMap &&
                Object.keys(essentialData.dbResultMap).length > 0 && (
                  <i
                    className="db-result"
                    onClick={() => toggleIsDBResultPopupOpen(true)}
                  >
                    資料庫
                    <br />
                    搜尋結果
                  </i>
                )}
              自動化專利審查系統
            </h1>
            <Popup
              open={isSettingPopupOpen}
              closeOnDocumentClick
              onClose={() => toggleIsSettingPopupOpen(false)}
            >
              <SettingsPopup
                setLocalStorageValue={setLocalStorageValue}
                handleClose={toggleIsSettingPopupOpen}
              />
            </Popup>
            <Popup
              open={isDBResultPopupOpen}
              closeOnDocumentClick
              onClose={() => toggleIsDBResultPopupOpen(false)}
            >
              <DBResultPopup handleClose={toggleIsDBResultPopupOpen} />
            </Popup>
            <section
              className="links-section"
              style={
                essentialData.pathName === "read-mode"
                  ? { display: "none" }
                  : {}
              }
            >
              <div></div>
              <ul>
                <li>
                  <Link
                    className={essentialData.pathName === "" ? "active" : ""}
                    to="/"
                  >
                    儀表板
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      essentialData.pathName === "abstract" ? "active" : ""
                    }
                    to="/abstract"
                  >
                    摘要&技術
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      essentialData.pathName === "disclosure" ? "active" : ""
                    }
                    to="/disclosure"
                  >
                    {essentialData.applicationNum === ""
                      ? "發明/新型"
                      : essentialData.applicationNum[3] === "1"
                      ? "發明"
                      : "新型"}
                    內容
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      essentialData.pathName === "mode-for-invention"
                        ? "active"
                        : ""
                    }
                    to="/mode-for-invention"
                  >
                    實施方式
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      essentialData.pathName === "claim" ? "active" : ""
                    }
                    to="/claim"
                  >
                    申請專利範圍
                  </Link>
                </li>
              </ul>
              <div className="analysis-result">
                <span>
                  <Link to="/result">分析結果</Link>
                </span>
              </div>
            </section>
            <div
              className="main-body"
              style={
                essentialData.pathName === "read-mode"
                  ? { paddingBottom: 0 }
                  : {}
              }
            >
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route path="/abstract" component={Abstract} />
                <Route
                  path="/disclosure"
                  render={() => <Disclosure handleReInit={handleReInit} />}
                />
                <Route
                  path="/mode-for-invention"
                  render={() => (
                    <ModeForInvention handleReInit={handleReInit} />
                  )}
                />
                <Route
                  path="/claim"
                  render={() => <Claims handleReInit={handleReInit} />}
                />
                <Route path="/readme" render={() => <Readme />} />
                <Route path="/result" render={() => <Result />} />
                <Route path="/read-mode" render={() => <ReadeMode />} />
              </Switch>
            </div>
          </Router>
        </div>
      </main>
    </div>
  );
}

const ReadeMode = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );

  useEffect(() => {
    setEssentialData((prev) => ({ ...prev, pathName: getPathName() }));
  }, []);

  return (
    <div className="main-body-grid">
      <div className="main-body-grid-item ">
        <SimpleDescription />
      </div>
      <div className="main-body-grid-item ">
        <SimpleClaims />
      </div>
    </div>
  );
};
