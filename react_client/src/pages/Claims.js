import React, { useContext, useEffect, useState } from "react";
import SingleClaim from "../components/SingleClaim";
import AddedClaim from "../components/AddedClaim";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { UpdateParagraphContextProvider } from "../contexts/UpdateParagraphContext";
import { getPathName } from "../utils/getPathName";
import EditingNewClaimTextArea from "../components/EditingNewClaimTextArea";
import searchImg from "../assets/search.png";
import Popup from "reactjs-popup";
import SearchPopup from "../components/SearchPopup";

const Claims = ({ handleReInit }) => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const {
    allUpdateClaimParagraph: allUpdateParagraph,
    setAllUpdateClaimParagraph: setAllUpdateParagraph
  } = useContext(UpdateParagraphContextProvider);
  const [isOnAdding, setIsOnAdding] = useState(false);
  const [AddingZoneValue, setAddingZoneValue] = useState({
    claimNum: "",
    content: ""
  });
  const [isSearchPopupOpen, toggleIsSearchPopupOpen] = useState(false);
  // const [searchString, setSearchString] = useState("");
  const searchString = essentialData.searchString;
  const setSearchString = (str) =>
    setEssentialData((prev) => ({ ...prev, searchString: str }));

  const setIsCollapse = (index) => {
    setEssentialData((prev) => ({
      ...prev,
      allClaimsDetails: essentialData.allClaimsDetails.map((claim, i) => {
        if (index === i) {
          return { ...claim, isCollapse: !claim.isCollapse };
        }
        return claim;
      })
    }));
  };

  const openOrCollapseAll = (method) => {
    setEssentialData((prev) => ({
      ...prev,
      allClaimsDetails: essentialData.allClaimsDetails.map((claim) => ({
        ...claim,
        isCollapse: method === "collapse" ? true : false
      }))
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

  const setNewContent = (paraIndex, newContent, newClaimNum) => {
    setAllUpdateParagraph((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx === paraIndex) {
          return {
            ...p,
            content: newContent,
            claimNum: newClaimNum,
            matches: null
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
            claimNum: null,
            matches: null
          };
        }
        return p;
      })
    );
  };

  const updateNewContent = (addedIdx, payload) => {
    if (!parseInt(payload.claimNum)) {
      window.alert("段落編號格式錯誤。");
      return;
    }
    if (
      essentialData.allDisclosureParagraphDetails.find(
        (p) => p.num === payload.claimNum
      ) ||
      allUpdateParagraph
        .filter((p) => p.addedIdx !== addedIdx)
        .find((p) => p.claimNum === payload.claimNum)
    ) {
      window.alert(`該段落編碼${payload.claimNum}已經被使用了。`);
      return;
    }
    setAllUpdateParagraph((prev) =>
      prev.map((p) => {
        if (p.addedIdx === addedIdx) {
          return {
            ...p,
            claimNum: payload.claimNum,
            content: payload.content,
            matches: null
          };
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

  const setNewMatches = (paraIndex, newMatches) => {
    setAllUpdateParagraph((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx === paraIndex) {
          // Test
          // console.log({
          //   ...p,
          //   content: null,
          //   claimNum: null,
          //   matches: newMatches
          // });
          // debugger;
          return {
            ...p,
            content: null,
            claimNum: null,
            matches: newMatches
          };
        }
        return p;
      })
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

  const handleSaveAll = async() => {
    if (!checkIfNumOK()) {
      window.alert(`請求項的編號有跳號，請檢查後再按確認。`);
      return;
    }
    // console.log(allUpdateParagraph);
    // debugger;
    await handleReInit(essentialData, setEssentialData, {
      method: "allClaimsDetails",
      data: allUpdateParagraph
    });
    setAllUpdateParagraph((prev) =>
      prev.map(() => ({
        claimNum: null,
        content: null,
        matches: null
      }))
    );
  };

  useEffect(() => {
    setEssentialData((prev) => ({ ...prev, pathName: getPathName() }));
  }, []);

  useEffect(() => {
    if (
      !essentialData.isProcessing &&
      essentialData.allClaimsDetails.length > 0 &&
      allUpdateParagraph.length === 0
    ) {
      setAllUpdateParagraph(
        essentialData.allClaimsDetails.map((_, idx) => ({
          claimNum: null,
          content: null,
          matches: null
        }))
      );
      setAddingZoneValue({ claimNum: "", content: "" });
    }
  }, [essentialData]);

  const checkIfNumOK = () => {
    if (allUpdateParagraph.filter((p) => p.isNewAdded).length === 0) {
      return true;
    }
    const firstaddedClaimNum = essentialData.allClaimsDetails.length + 1;
    const lastAddedClaimNum = allUpdateParagraph.length;
    const allAddedClaimNum = [...allUpdateParagraph]
      .filter((p) => p.isNewAdded)
      .sort((a, b) => parseInt(a.claimNum) - parseInt(b.claimNum))
      .map((m) => parseInt(m.claimNum));

    return (
      allAddedClaimNum.length ===
        allUpdateParagraph.filter((p) => p.isNewAdded).length &&
      allAddedClaimNum[0] === firstaddedClaimNum &&
      allAddedClaimNum[allAddedClaimNum.length - 1] === lastAddedClaimNum
    );
  };

  return (
    <>
      <section className="title-section sticky">
        <h1 style={{ color: "transparent" }}>申請專利範圍</h1>
        {!essentialData.isProcessing &&
          essentialData.allClaimsDetails.length > 0 && (
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
                    if (!isOnAdding) {
                      setAddingZoneValue((prev) => ({
                        ...prev,
                        claimNum: (allUpdateParagraph.length + 1).toString()
                      }));
                    }
                    setIsOnAdding((prev) => !prev);
                  }}
                >
                  {isOnAdding ? "取消" : "新增"}
                </button>
                {!allUpdateParagraph.every(
                  (ct) =>
                    ct.content === null &&
                    ct.claimNum === null &&
                    ct.matches === null
                ) && (
                  <>
                    <button onClick={handleSaveAll}>全部儲存</button>
                    <button
                      onClick={() => {
                        setAllUpdateParagraph((prev) =>
                          prev
                            .filter((p) => !p.isNewAdded)
                            .map(() => ({
                              claimNum: null,
                              content: null,
                              matches: null
                            }))
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
            <h1>申請專利範圍</h1>
            <h3>Processing...</h3>
          </div>
        ) : essentialData.allClaimsDetails.length === 0 ? (
          <div>
            <h1>申請專利範圍</h1>
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

            <h1>申請專利範圍</h1>

            {isOnAdding && (
              <div className="add-new-paragraph">
                <p>新增段落</p>
                <label>
                  段落編號:{" "}
                  <input
                    value={AddingZoneValue.claimNum}
                    onChange={(e) =>
                      setAddingZoneValue((prev) => ({
                        ...prev,
                        claimNum: e.target.value
                      }))
                    }
                    type="text"
                  />
                </label>
                {/* <textarea
                  value={AddingZoneValue.content}
                  onChange={(e) =>
                    setAddingZoneValue((prev) => ({
                      ...prev,
                      content: e.target.value
                    }))
                  }
                /> */}
                <EditingNewClaimTextArea
                  editingZoneValue={AddingZoneValue}
                  setEditingZoneValue={setAddingZoneValue}
                />
                <div>
                  {AddingZoneValue.claimNum !== "" &&
                    AddingZoneValue.content !== "" && (
                      <button
                        onClick={() => {
                          if (!parseInt(AddingZoneValue.claimNum)) {
                            window.alert("段落編號格式錯誤。");
                            return;
                          }
                          if (
                            essentialData.allDisclosureParagraphDetails.find(
                              (p) => p.num === AddingZoneValue.claimNum
                            ) ||
                            allUpdateParagraph.find(
                              (p) => p.claimNum === AddingZoneValue.claimNum
                            )
                          ) {
                            window.alert(
                              `該請求項編號${AddingZoneValue.claimNum}已經被使用了。`
                            );
                            return;
                          }
                          setAllUpdateParagraph((prev) => [
                            ...prev,
                            {
                              addedIdx: Math.random().toString().slice(2, 8),
                              claimNum: AddingZoneValue.claimNum,
                              content: AddingZoneValue.content,
                              isNewAdded: true,
                              isCollapse: false
                            }
                          ]);
                          setAddingZoneValue({ claimNum: "", content: "" });
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

            {essentialData.allClaimsDetails.map(
              (claimDetail, index) =>
                allUpdateParagraph[index] && (
                  <SingleClaim
                    key={index}
                    index={index}
                    allClaimContent={essentialData.allClaimsDetails.map(
                      ({ content }) => content
                    )}
                    num={claimDetail.num.toString()}
                    type={claimDetail.type}
                    attemptAttaches={claimDetail.attemptAttaches}
                    attaches={claimDetail.attaches}
                    content={claimDetail.content}
                    modifiedClaim={claimDetail.modifiedClaim}
                    claimSearchPath={claimDetail.claimSearchPath}
                    matches={claimDetail.matches}
                    usedElements={claimDetail.usedElements}
                    nonMatches={claimDetail.nonMatches}
                    preUsedElementsNonUsed={claimDetail.preUsedElementsNonUsed}
                    errors={claimDetail.errors}
                    elementColorMap={essentialData.elementColorMap}
                    isCollapse={claimDetail.isCollapse}
                    setIsCollapse={setIsCollapse}
                    setNewContent={setNewContent}
                    setOldContent={setOldContent}
                    setNewMatches={setNewMatches}
                    preSavedClaimNum={
                      allUpdateParagraph[index] &&
                      allUpdateParagraph[index].claimNum
                    }
                    preSavedContent={
                      allUpdateParagraph[index] &&
                      allUpdateParagraph[index].content
                    }
                    preSavedMatches={
                      allUpdateParagraph[index] &&
                      allUpdateParagraph[index].matches
                    }
                    handleSaveAll={handleSaveAll}
                    searchString={searchString}
                    globalHighlightOn={essentialData.globalHighlightOn}
                    globalHighlightElement={
                      essentialData.globalHighlightElement
                    }
                  />
                )
            )}

            {allUpdateParagraph.filter((p) => p.isNewAdded).length > 0 &&
              allUpdateParagraph
                .filter((p) => p.isNewAdded)
                .map((para) => (
                  <AddedClaim
                    key={para.addedIdx}
                    addedIdx={para.addedIdx}
                    claimNum={para.claimNum}
                    content={para.content}
                    updateNewContent={updateNewContent}
                    deleteNewContent={deleteNewContent}
                    isCollapse={para.isCollapse}
                    openOrCollapseNewContent={openOrCollapseNewContent}
                  />
                ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Claims;
