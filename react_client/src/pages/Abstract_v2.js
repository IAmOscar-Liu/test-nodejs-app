import React, { useContext, useEffect, useState } from "react";
import SingleParagraph from "../components/SingleParagraph_v2";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { getPathName } from "../utils/getPathName";
import searchImg from "../assets/search.png";
import Popup from "reactjs-popup";
import SearchPopup from "../components/SearchPopup";

const AbstractV2 = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );

  const [isSearchPopupOpen, toggleIsSearchPopupOpen] = useState(false);
  //const [searchString, setSearchString] = useState("");
  const searchString = essentialData.searchString;
  const setSearchString = (str) =>
    setEssentialData((prev) => ({ ...prev, searchString: str }));

  const setIsCollapse = (general) => {
    setEssentialData((prev) => ({
      ...prev,
      allAbstractParagraphDetails: essentialData.allAbstractParagraphDetails.map(
        (paragraph) => {
          if (general === paragraph.general) {
            return { ...paragraph, isCollapse: !paragraph.isCollapse };
          }
          return paragraph;
        }
      ),
      allTechnicalFieldParagraphDetails: essentialData.allTechnicalFieldParagraphDetails.map(
        (paragraph) => {
          if (general === paragraph.general) {
            return { ...paragraph, isCollapse: !paragraph.isCollapse };
          }
          return paragraph;
        }
      ),
      allBackgroundArtParagraphDetails: essentialData.allBackgroundArtParagraphDetails.map(
        (paragraph) => {
          if (general === paragraph.general) {
            return { ...paragraph, isCollapse: !paragraph.isCollapse };
          }
          return paragraph;
        }
      )
    }));
  };

  const openOrCollapseAll = (method) => {
    setEssentialData((prev) => ({
      ...prev,
      allAbstractParagraphDetails: essentialData.allAbstractParagraphDetails.map(
        (paragraph) => ({
          ...paragraph,
          isCollapse: method === "collapse" ? true : false
        })
      ),
      allTechnicalFieldParagraphDetails: essentialData.allTechnicalFieldParagraphDetails.map(
        (paragraph) => ({
          ...paragraph,
          isCollapse: method === "collapse" ? true : false
        })
      ),
      allBackgroundArtParagraphDetails: essentialData.allBackgroundArtParagraphDetails.map(
        (paragraph) => ({
          ...paragraph,
          isCollapse: method === "collapse" ? true : false
        })
      )
    }));
  };

  useEffect(() => {
    setEssentialData((prev) => ({ ...prev, pathName: getPathName() }));
  }, []);

  return (
    <>
      <section className="title-section sticky">
        <h1 style={{ color: "transparent" }}>摘要</h1>
        {!essentialData.isProcessing &&
          essentialData.allAbstractParagraphDetails.length > 0 && (
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
          )}
      </section>
      <section className="all-paragraph-section">
        {essentialData.isProcessing ? (
          <div>
            <h1>摘要&技術</h1>
            <h3>Processing...</h3>
          </div>
        ) : essentialData.allAbstractParagraphDetails.length === 0 ? (
          <div>
            <h1>摘要&技術</h1>
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

            <h1>摘要&技術</h1>

            <h6>
              中文{essentialData.applicationNum[3] === "1" ? "發明" : "新型"}
              名稱：
              {essentialData.applicationNum[3] !== "1" &&
              /(方法|程序|流程|步驟)$/.test(essentialData.utilityModelTitle) ? (
                <>
                  {essentialData.utilityModelTitle.slice(
                    0,
                    essentialData.utilityModelTitle.match(
                      /(方法|程序|流程|步驟)$/
                    ).index
                  )}
                  <b style={{ background: "red" }}>
                    {essentialData.utilityModelTitle.slice(
                      essentialData.utilityModelTitle.match(
                        /(方法|程序|流程|步驟)$/
                      ).index
                    )}
                  </b>
                </>
              ) : (
                essentialData.utilityModelTitle
              )}
            </h6>
            {essentialData.utilityModelTitleEn && (
              <h6>
                英文{essentialData.applicationNum[3] === "1" ? "發明" : "新型"}
                名稱：{essentialData.utilityModelTitleEn}
              </h6>
            )}

            {[
              ...essentialData.allAbstractParagraphDetails,
              ...essentialData.allTechnicalFieldParagraphDetails,
              ...essentialData.allBackgroundArtParagraphDetails
            ].map((paragraphDetail, index) => (
              <SingleParagraph
                key={index}
                index={index}
                isOK={paragraphDetail.isOK}
                general={paragraphDetail.general}
                content={paragraphDetail.content}
                abstractEn={essentialData.abstractContentEn?.[index]}
                modifiedParagraph={paragraphDetail.modifiedParagraph}
                figureKeys={paragraphDetail.paragraphMatch.figures}
                wrongFigureKeys={paragraphDetail.paragraphMatch.figuresErrors}
                correctKeys={paragraphDetail.paragraphMatch.corrects}
                wrongWordKeys={paragraphDetail.paragraphMatch.wrongWords}
                aboriginalWordKeys={
                  paragraphDetail.paragraphMatch.aboriginalWords
                }
                elementColorMap={essentialData.elementColorMap}
                isCollapse={paragraphDetail.isCollapse}
                setIsCollapse={setIsCollapse}
                searchString={searchString}
                globalHighlightOn={essentialData.globalHighlightOn}
                globalHighlightElement={essentialData.globalHighlightElement}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default AbstractV2;
