import React, { useContext, useEffect, useState } from "react";
import SingleParagraph from "../components/SingleParagraph";
import AddedParagraph from "../components/AddedParagraph";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { UpdateParagraphContextProvider } from "../contexts/UpdateParagraphContext";
import { getPathName } from "../utils/getPathName";
import searchImg from "../assets/search.png";
import Popup from "reactjs-popup";
import SearchPopup from "../components/SearchPopup";

const ModeForEnvention = ({ handleReInit }) => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const {
    allUpdateModeForInventionParagraph: allUpdateParagraph,
    setAllUpdateModeForInventionParagraph: setAllUpdateParagraph
  } = useContext(UpdateParagraphContextProvider);

  const [isOnAdding, setIsOnAdding] = useState(false);
  const [AddingZoneValue, setAddingZoneValue] = useState({
    general: "",
    content: ""
  });
  const [isSearchPopupOpen, toggleIsSearchPopupOpen] = useState(false);
  //const [searchString, setSearchString] = useState("");
  const searchString = essentialData.searchString;
  const setSearchString = (str) =>
    setEssentialData((prev) => ({ ...prev, searchString: str }));

  const setIsCollapse = (index) => {
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
  };

  const openOrCollapseAll = (method) => {
    setEssentialData((prev) => ({
      ...prev,
      allModeForInventionParagraphDetails: essentialData.allModeForInventionParagraphDetails.map(
        (paragraph) => ({
          ...paragraph,
          isCollapse: method === "collapse" ? true : false
        })
      )
    }));
    setAllUpdateParagraph((prev) =>
      prev.map((p) => {
        if (p.isNewAdded) {
          return { ...p, isCollapse: method === "collapse" ? true : false };
        }
        return p;
      })
    );
  };

  const setNewContent = (paraIndex, newContent, newGeneral) => {
    if (!parseInt(newGeneral)) {
      throw Error("段落編號格式錯誤。");
    }
    if (
      essentialData.allModeForInventionParagraphDetails
        .filter((_, pIdx) => pIdx !== paraIndex)
        .find((p) => p.general === newGeneral) ||
      allUpdateParagraph.find((p) => p.general === newGeneral)
    ) {
      throw Error(`該段落編碼${newGeneral}已經被使用了。`);
    }
    setAllUpdateParagraph((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx === paraIndex) {
          return {
            ...p,
            content: newContent,
            general: newGeneral
          };
        }
        return p;
      })
    );
  };

  const setOldContent = (paraIndex) => {
    setAllUpdateParagraph((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx === paraIndex) {
          return {
            ...p,
            content: null,
            general: null
          };
        }
        return p;
      })
    );
  };

  const setDeleteContent = (paraIndex) => {
    setAllUpdateParagraph((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx === paraIndex) {
          return {
            ...p,
            isDelete: true
          };
        }
        return p;
      })
    );
  };

  const updateNewContent = (addedIdx, payload) => {
    if (!parseInt(payload.general)) {
      throw Error("段落編號格式錯誤。");
    }
    if (
      essentialData.allModeForInventionParagraphDetails.find(
        (p) => p.general === payload.general
      ) ||
      allUpdateParagraph
        .filter((p) => p.addedIdx !== addedIdx)
        .find((p) => p.general === payload.general)
    ) {
      throw Error(`該段落編碼${payload.general}已經被使用了。`);
    }
    setAllUpdateParagraph((prev) =>
      prev.map((p) => {
        if (p.addedIdx === addedIdx) {
          return { ...p, general: payload.general, content: payload.content };
        }
        return p;
      })
    );
  };

  const deleteNewContent = (addedIdx) => {
    setAllUpdateParagraph((prev) =>
      prev.filter((p) => p.addedIdx !== addedIdx)
    );
  };

  const openOrCollapseNewContent = (addedIdx) => {
    setAllUpdateParagraph((prev) =>
      prev.map((p) => {
        if (p.addedIdx === addedIdx) {
          return {
            ...p,
            isCollapse: !p.isCollapse
          };
        }
        return p;
      })
    );
  };

  useEffect(() => {
    setEssentialData((prev) => ({ ...prev, pathName: getPathName() }));
  }, []);

  useEffect(() => {
    if (
      !essentialData.isProcessing &&
      essentialData.allModeForInventionParagraphDetails.length > 0 &&
      allUpdateParagraph.length === 0
    ) {
      setAllUpdateParagraph(
        essentialData.allModeForInventionParagraphDetails.map((_, idx) => ({
          general: null,
          content: null
        }))
      );
      setAddingZoneValue({
        general: "",
        content: ""
      });
    }
  }, [essentialData]);

  return (
    <>
      <section className="title-section sticky">
        <h1 style={{ color: "transparent" }}>實施方式</h1>
        {!essentialData.isProcessing &&
          essentialData.allModeForInventionParagraphDetails.length > 0 && (
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

              <div className="all-paragraph-section-save-btns">
                <button
                  onClick={() => {
                    setIsOnAdding((prev) => !prev);
                  }}
                >
                  {isOnAdding ? "取消" : "新增"}
                </button>
                {!allUpdateParagraph.every(
                  (ct) =>
                    ct.content === null && ct.general === null && !ct.isDelete
                ) && (
                  <>
                    <button
                      onClick={async() => {
                        await handleReInit(essentialData, setEssentialData, {
                          method: "allModeForInventionParagraphDetails",
                          data: allUpdateParagraph
                        });
                        setAllUpdateParagraph((prev) =>
                          prev.map((p) => ({ content: null, general: null }))
                        );
                      }}
                    >
                      全部儲存
                    </button>
                    <button
                      onClick={() => {
                        setAllUpdateParagraph((prev) =>
                          prev
                            .filter((p) => !p.isNewAdded)
                            .map((p) => ({ content: null, general: null }))
                        );
                      }}
                    >
                      全部還原
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
      </section>
      <section className="all-paragraph-section">
        {essentialData.isProcessing ? (
          <div>
            <h1>實施方式</h1>
            <h3>Processing...</h3>
          </div>
        ) : essentialData.allModeForInventionParagraphDetails.length === 0 ? (
          <div>
            <h1>實施方式</h1>
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

            <h1>實施方式</h1>

            {isOnAdding && (
              <div className="add-new-paragraph">
                <p>新增段落</p>
                <label>
                  段落編號:{" "}
                  <input
                    value={AddingZoneValue.general}
                    onChange={(e) =>
                      setAddingZoneValue((prev) => ({
                        ...prev,
                        general: e.target.value
                      }))
                    }
                    type="text"
                  />
                </label>
                <textarea
                  value={AddingZoneValue.content}
                  onChange={(e) =>
                    setAddingZoneValue((prev) => ({
                      ...prev,
                      content: e.target.value
                    }))
                  }
                />
                <div>
                  {AddingZoneValue.general !== "" &&
                    AddingZoneValue.content !== "" && (
                      <button
                        onClick={() => {
                          if (!parseInt(AddingZoneValue.general)) {
                            window.alert("段落編號格式錯誤。");
                            return;
                          }
                          if (
                            essentialData.allModeForInventionParagraphDetails.find(
                              (p) => p.general === AddingZoneValue.general
                            ) ||
                            allUpdateParagraph.find(
                              (p) => p.general === AddingZoneValue.general
                            )
                          ) {
                            window.alert(
                              `該段落編碼${AddingZoneValue.general}已經被使用了。`
                            );
                            return;
                          }
                          setAllUpdateParagraph((prev) => [
                            ...prev,
                            {
                              addedIdx: Math.random().toString().slice(2, 8),
                              general: AddingZoneValue.general,
                              content: AddingZoneValue.content,
                              isNewAdded: true,
                              isCollapse: false
                            }
                          ]);
                          setAddingZoneValue({ general: "", content: "" });
                          setIsOnAdding(false);
                        }}
                      >
                        確認
                      </button>
                    )}
                  <button onClick={() => setIsOnAdding(false)}>取消</button>
                </div>
              </div>
            )}

            {allUpdateParagraph.filter((p) => p.isNewAdded).length > 0 &&
              allUpdateParagraph
                .filter((p) => p.isNewAdded)
                .map((para) => (
                  <AddedParagraph
                    key={para.addedIdx}
                    addedIdx={para.addedIdx}
                    content={para.content}
                    general={para.general}
                    updateNewContent={updateNewContent}
                    deleteNewContent={deleteNewContent}
                    isCollapse={para.isCollapse}
                    openOrCollapseNewContent={openOrCollapseNewContent}
                  />
                ))}

            {essentialData.allModeForInventionParagraphDetails.map(
              (paragraphDetail, index) =>
                allUpdateParagraph[index] &&
                allUpdateParagraph[index].isDelete ? (
                  <div key={index} className="paragraph-container">
                    <h2
                      style={{
                        background: "red",
                        boxShadow: "2px 2px 4px 2px #773333"
                      }}
                    >
                      段落[
                      {allUpdateParagraph[index].general ||
                        paragraphDetail.general}
                      ]已刪除
                      <span
                        style={{
                          width: "auto",
                          padding: "3px .2em",
                          fontSize: ".8em"
                        }}
                        onClick={() =>
                          setAllUpdateParagraph((prev) =>
                            prev.map((p, pIdx) => {
                              if (index === pIdx) {
                                return { ...p, isDelete: false };
                              }
                              return p;
                            })
                          )
                        }
                      >
                        還原
                      </span>
                    </h2>
                  </div>
                ) : (
                  <SingleParagraph
                    key={index}
                    index={index}
                    isOK={paragraphDetail.isOK}
                    dataType={"madeForInvention"}
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
                    setNewContent={setNewContent}
                    setOldContent={setOldContent}
                    setDeleteContent={setDeleteContent}
                    // resetRandomNum={resetRandomNum}
                    preSavedContent={
                      allUpdateParagraph[index] &&
                      allUpdateParagraph[index].content
                    }
                    preSavedGeneral={
                      allUpdateParagraph[index] &&
                      allUpdateParagraph[index].general
                    }
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

export default ModeForEnvention;
