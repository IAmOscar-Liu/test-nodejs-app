import React, { useContext, useState } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { XMLContextProvider } from "../contexts/XMLContext";

const SidebarLayout = ({ children }) => {
  const [hide, toggleHide] = useState(true);
  const [essentialData] = useContext(EssentialDataContextProvider);
  const [XMLData] = useContext(XMLContextProvider);

  const handleOnScroll = () => {
    const topOffset = document.querySelector(".App .side").scrollTop;
    if (topOffset > 500 && hide) {
      toggleHide(false);
    } else if (topOffset <= 500 && !hide) {
      toggleHide(true);
    }
  };
  /*
    personalSettings: {
      isDarkMode: false,
  */
  // useEffect(() => {
  //   document
  //     .querySelector(".App .side")
  //     .addEventListener("scroll", handleOnScroll);

  //   return () =>
  //     document
  //       .querySelector(".App .side")
  //       .removeEventListener("scroll", handleOnScroll);
  // }, []);

  return (
    <main
      className={`side ${
        essentialData.personalSettings.isDarkMode ? "dark" : ""
      }`}
      onScroll={handleOnScroll}
    >
      <div>
        <h1 className="sidebar-h1">
          元件名稱與符號
          {XMLData.applicationNum && essentialData.utilityModelTitle && (
            <p>
              <span>
                {XMLData.applicationNum[3] === "1" ? "發明" : "新型"}案號：
                <i>{XMLData.applicationNum}</i>
              </span>
              <span>
                {XMLData.applicationNum[3] === "1" ? "發明" : "新型"}名稱：
                {essentialData.utilityModelTitle}
              </span>
            </p>
          )}
        </h1>
        {children}
        <span
          className={`sidebar-gotop ${hide ? "hide" : ""}`}
          onClick={() => {
            document.querySelector(".App .side").scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth"
            });
            toggleHide(true);
          }}
        >
          ▲
        </span>
      </div>
    </main>
  );
};

export default SidebarLayout;
