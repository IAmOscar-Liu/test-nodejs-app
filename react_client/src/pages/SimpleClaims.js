import React, { useContext, useState } from "react";
import SingleClaimSimple from "../components/SingleClaimSimple";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import searchImg from "../assets/search.png";
import Popup from "reactjs-popup";
import SearchPopup from "../components/SearchPopup";

const SimpleClaims = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
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

            <h1 style={{ left: "2vw", transform: "unset" }}>申請專利範圍</h1>

            {essentialData.allClaimsDetails.map((claimDetail, index) => (
              <SingleClaimSimple
                key={index}
                index={index}
                num={claimDetail.num.toString()}
                type={claimDetail.type}
                allClaimContent={essentialData.allClaimsDetails.map(
                  ({ content }) => content
                )}
                content={claimDetail.content}
                modifiedClaim={claimDetail.modifiedClaim}
                claimSearchPath={claimDetail.claimSearchPath}
                matches={claimDetail.matches}
                usedElements={claimDetail.usedElements}
                nonMatches={claimDetail.nonMatches}
                errors={claimDetail.errors}
                elementColorMap={essentialData.elementColorMap}
                isCollapse={claimDetail.isCollapse}
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

export default SimpleClaims;
