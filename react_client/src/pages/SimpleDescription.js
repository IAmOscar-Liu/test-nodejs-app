import React, { useContext, useState } from "react";
import SingleParagraphSimple from "../components/SingleParagraphSimple";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import searchImg from "../assets/search.png";
import Popup from "reactjs-popup";
import SearchPopup from "../components/SearchPopup";

const SimpleDescription = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const [isSearchPopupOpen, toggleIsSearchPopupOpen] = useState(false);
  const [showParagraphes, setShowParagraphes] = useState("disclosure");
  const searchString = essentialData.searchString;
  const setSearchString = (str) =>
    setEssentialData((prev) => ({ ...prev, searchString: str }));

  const setIsCollapse = (index, dataType) => {
    if (dataType === "disclosure") {
      setEssentialData((prev) => ({
        ...prev,
        allDisclosureParagraphDetails: essentialData.allDisclosureParagraphDetails.map(
          (paragraph, i) => {
            if (index === i) {
              return { ...paragraph, isCollapse: !paragraph.isCollapse };
            }
            return paragraph;
          }
        )
      }));
    } else {
      setEssentialData((prev) => ({
        ...prev,
        allModeForInventionParagraphDetails: essentialData.allModeForInventionParagraphDetails.map(
          (paragraph, i) => {
            if (index === i) {
              return { ...paragraph, isCollapse: !paragraph.isCollapse };
            }
            return paragraph;
          }
        )
      }));
    }
  };

  const openOrCollapseAll = (method) => {
    setEssentialData((prev) => ({
      ...prev,
      allDisclosureParagraphDetails: essentialData.allDisclosureParagraphDetails.map(
        (paragraph) => ({
          ...paragraph,
          isCollapse: method === "collapse" ? true : false
        })
      ),
      allModeForInventionParagraphDetails: essentialData.allModeForInventionParagraphDetails.map(
        (claim) => ({
          ...claim,
          isCollapse: method === "collapse" ? true : false
        })
      )
    }));
  };

  return (
    <>
      <section className="title-section sticky">
        <h1 style={{ color: "transparent" }}>
          {essentialData.applicationNum[3] === "1" ? "發明" : "新型"}說明書
        </h1>
        {!essentialData.isProcessing &&
          (essentialData.allDisclosureParagraphDetails.length > 0 ||
            essentialData.allModeForInventionParagraphDetails.length > 0) && (
            <>
              <h6>
                <button
                  onClick={() => setShowParagraphes("disclosure")}
                  className={showParagraphes === "disclosure" ? "active" : ""}
                >
                  {essentialData.applicationNum[3] === "1" ? "發明" : "新型"}
                  內容
                </button>
                <button
                  onClick={() => setShowParagraphes("mode-for-invention")}
                  className={
                    showParagraphes === "mode-for-invention" ? "active" : ""
                  }
                >
                  實施方式
                </button>
                <button
                  onClick={() => setShowParagraphes("all")}
                  className={showParagraphes === "all" ? "active" : ""}
                >
                  整份說明書
                </button>
              </h6>
              <div>
                <button onClick={() => openOrCollapseAll("collapse")}>
                  &#x292C; 全部收合
                </button>
                <button onClick={() => openOrCollapseAll("open")}>
                  &#x271B; 全部展開
                </button>
                <button
                  onClick={(e) => {
                    if (e.target.tagName !== "B") {
                      toggleIsSearchPopupOpen(true);
                    }
                  }}
                  className={searchString ? "withStr" : ""}
                >
                  <img src={searchImg} alt="" />
                  {searchString && (
                    <>
                      <span
                        style={{
                          flexGrow: 1,
                          textAlign: "start",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {searchString}
                      </span>
                      <b
                        style={{ paddingRight: 6, fontSize: "1.06em" }}
                        onClick={() => {
                          toggleIsSearchPopupOpen(false);
                          setSearchString("");
                        }}
                      >
                        ⤬
                      </b>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
      </section>
      <section className="all-paragraph-section">
        {essentialData.isProcessing ? (
          <div>
            <h1>
              {essentialData.applicationNum[3] === "1" ? "發明" : "新型"}說明書
            </h1>
            <h3>Processing...</h3>
          </div>
        ) : essentialData.allDisclosureParagraphDetails.length === 0 &&
          essentialData.allModeForInventionParagraphDetails.length === 0 ? (
          <div>
            <h1>
              {essentialData.applicationNum[3] === "1" ? "發明" : "新型"}說明書
            </h1>
            <h3>No data passed in yet.</h3>
          </div>
        ) : (
          <div>
            <Popup
              open={isSearchPopupOpen}
              closeOnDocumentClick
              onClose={() => toggleIsSearchPopupOpen(false)}
            >
              <SearchPopup
                handleClose={toggleIsSearchPopupOpen}
                searchString={searchString}
                setSearchString={setSearchString}
              />
            </Popup>

            <h1
              style={{
                left: "2vw",
                transform: "translateY(-40px)",
                paddingBlock: 0
              }}
            >
              {essentialData.applicationNum[3] === "1" ? "發明" : "新型"}說明書
            </h1>

            {(showParagraphes === "disclosure" || showParagraphes === "all") &&
              essentialData.allDisclosureParagraphDetails.map(
                (paragraphDetail, index) => (
                  <SingleParagraphSimple
                    key={index}
                    index={index}
                    dataType={"disclosure"}
                    applicationNum={essentialData.applicationNum}
                    general={paragraphDetail.general}
                    content={paragraphDetail.content}
                    modifiedParagraph={paragraphDetail.modifiedParagraph}
                    figureKeys={paragraphDetail.paragraphMatch.figures}
                    wrongFigureKeys={
                      paragraphDetail.paragraphMatch.figuresErrors
                    }
                    correctKeys={paragraphDetail.paragraphMatch.corrects}
                    wrongKeys={paragraphDetail.paragraphMatch.wrongs}
                    potentialWrongKeys={
                      paragraphDetail.paragraphMatch.potentialErrors
                    }
                    wrongWordKeys={paragraphDetail.paragraphMatch.wrongWords}
                    aboriginalWordKeys={
                      paragraphDetail.paragraphMatch.aboriginalWords
                    }
                    elementColorMap={essentialData.elementColorMap}
                    isCollapse={paragraphDetail.isCollapse}
                    setIsCollapse={setIsCollapse}
                    searchString={searchString}
                    globalHighlightOn={essentialData.globalHighlightOn}
                    globalHighlightElement={
                      essentialData.globalHighlightElement
                    }
                  />
                )
              )}
            {(showParagraphes === "mode-for-invention" ||
              showParagraphes === "all") &&
              essentialData.allModeForInventionParagraphDetails.map(
                (paragraphDetail, index) => (
                  <SingleParagraphSimple
                    key={index}
                    index={index}
                    dataType={"mode-for-invention"}
                    applicationNum={essentialData.applicationNum}
                    general={paragraphDetail.general}
                    content={paragraphDetail.content}
                    modifiedParagraph={paragraphDetail.modifiedParagraph}
                    figureKeys={paragraphDetail.paragraphMatch.figures}
                    wrongFigureKeys={
                      paragraphDetail.paragraphMatch.figuresErrors
                    }
                    correctKeys={paragraphDetail.paragraphMatch.corrects}
                    wrongKeys={paragraphDetail.paragraphMatch.wrongs}
                    potentialWrongKeys={
                      paragraphDetail.paragraphMatch.potentialErrors
                    }
                    wrongWordKeys={paragraphDetail.paragraphMatch.wrongWords}
                    aboriginalWordKeys={
                      paragraphDetail.paragraphMatch.aboriginalWords
                    }
                    elementColorMap={essentialData.elementColorMap}
                    isCollapse={paragraphDetail.isCollapse}
                    setIsCollapse={setIsCollapse}
                    searchString={searchString}
                    globalHighlightOn={essentialData.globalHighlightOn}
                    globalHighlightElement={
                      essentialData.globalHighlightElement
                    }
                  />
                )
              )}
          </div>
        )}
      </section>
    </>
  );
};

export default SimpleDescription;
