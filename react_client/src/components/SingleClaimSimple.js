import React, { useRef, useState, useEffect, useContext } from "react";
import checkedImg from "../assets/checked.png";
import errorImg from "../assets/error.png";
import ReactTooltip from "react-tooltip";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";

const highlightButtonStyle = {
  background: "rgb(182, 100, 71)",
  color: "rgb(238, 238, 238)",
  border: "none",
  outline: "none",
  cursor: "pointer",
  fontSize: "0.9em",
  padding: "2px 0.3em",
  borderRadius: "0.4em",
  margin: "0 1.5vw 0 auto",
  alignSelf: "center",
  whiteSpace: "nowrap"
};

const SingleClaimSimple = ({
  index,
  num,
  type,
  allClaimContent,
  content,
  modifiedClaim,
  claimSearchPath,
  matches,
  usedElements,
  nonMatches,
  errors,
  elementColorMap,
  isCollapse,
  setIsCollapse,
  searchString,
  globalHighlightOn,
  globalHighlightElement
}) => {
  const divRef = useRef(null);
  const searchStringPrev = useRef(searchString);
  const [numOfFoundedStr, setNumOfFoundedStr] = useState(0);
  const [myReduceMatches, setMyReduceMatches] = useState({});
  const [myReduceUsedElements, setMyReduceUsedElements] = useState({});
  const [myReduceNonMatches, setMyReduceNonMatches] = useState({});
  const [myReduceModifiedMatches, setMyReduceModifiedMatches] = useState({});

  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );

  const toggleBtnColor = (key) => {
    if (essentialData.personalSettings.synchronizeHighlight) {
      const prevGlobalHighlightElement = [
        ...essentialData.globalHighlightElement
      ];

      if (prevGlobalHighlightElement.find((el) => el === key)) {
        setEssentialData((prev) => ({
          ...prev,
          globalHighlightOn: prevGlobalHighlightElement.length !== 1,
          globalHighlightElement: prevGlobalHighlightElement.filter(
            (g) => g !== key
          )
        }));
      } else {
        setEssentialData((prev) => ({
          ...prev,
          globalHighlightOn: true,
          globalHighlightElement: [...prevGlobalHighlightElement, key]
        }));
      }
    } else {
      divRef.current.querySelectorAll(`.c-${key}`).forEach((el) => {
        el.style.background = myReduceMatches[key].clicked
          ? "inherit"
          : (elementColorMap[key] && elementColorMap[key].color) ||
            "transparent";
      });

      divRef.current.querySelectorAll(`.u-${key}`).forEach((el) => {
        if (myReduceMatches[key]) {
          el.style.background = myReduceMatches[key].clicked
            ? "inherit"
            : (elementColorMap[key] && elementColorMap[key].color) ||
              "transparent";
        } else if (myReduceUsedElements[key]) {
          el.style.background = myReduceUsedElements[key].clicked
            ? "inherit"
            : (elementColorMap[key] && elementColorMap[key].color) ||
              "transparent";
        }
      });

      if (myReduceMatches[key]) {
        setMyReduceMatches({
          ...myReduceMatches,
          [key]: {
            ...myReduceMatches[key],
            clicked: !myReduceMatches[key].clicked
          }
        });
      }
      if (myReduceUsedElements[key]) {
        setMyReduceUsedElements({
          ...myReduceUsedElements,
          [key]: {
            ...myReduceUsedElements[key],
            clicked: !myReduceUsedElements[key].clicked
          }
        });
      }
    }
  };

  const toggleErrorBtnColor = (key) => {
    divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
      el.style.background = myReduceNonMatches[key].clicked
        ? "inherit"
        : "rgb(255,0,0)";
    });

    setMyReduceNonMatches({
      ...myReduceNonMatches,
      [key]: {
        ...myReduceNonMatches[key],
        clicked: !myReduceNonMatches[key].clicked
      }
    });
  };

  const toggleModifiedBtnColor = (key) => {
    divRef.current.querySelectorAll(`.m-${key}`).forEach((el) => {
      el.style.background = myReduceModifiedMatches[key].clicked
        ? "inherit"
        : "hotpink";
    });

    setMyReduceModifiedMatches({
      ...myReduceModifiedMatches,
      [key]: {
        ...myReduceModifiedMatches[key],
        clicked: !myReduceModifiedMatches[key].clicked
      }
    });
  };

  const buildList = (_modifiedClaim, _modifiedClaimWithSearchStr) => {
    divRef.current.querySelector(".content").innerHTML =
      `【請求項${num}】 ` +
      (_modifiedClaimWithSearchStr || _modifiedClaim)
        .split(`@##@`)
        .map((sentence, _iidd) => {
          if (_iidd !== 0) {
            return "&nbsp;".repeat(6) + sentence;
          }
          return sentence;
        })
        .join(`<br/>`);

    if (type === "unknown") {
      return;
    }

    let reduceMatches = {};
    matches.forEach(({ group, value, item, isOK, keys, keyFromGroup }) => {
      if (!isOK) return;
      if (!reduceMatches[group]) {
        reduceMatches[group] = {
          group,
          keyFromGroup,
          value,
          item,
          // clicked: true,
          clicked:
            globalHighlightOn &&
            (globalHighlightElement.length === 0 ||
              globalHighlightElement.find((g) => g === group)),
          isOK,
          keys: keys ? keys : []
        };
      } else if (keys) {
        let newKeys = reduceMatches[group].keys.slice();
        keys.forEach((k) => {
          if (!newKeys.includes(k)) {
            newKeys.push(k);
          }
        });
        reduceMatches[group].keys = newKeys;
      }
    });

    let reduceUsedElements = {};
    usedElements.forEach(({ group, value, item, keys, keyFromGroup }) => {
      if (!reduceUsedElements[group]) {
        reduceUsedElements[group] = {
          group,
          keyFromGroup,
          value,
          item,
          // clicked: true,
          clicked:
            globalHighlightOn &&
            (globalHighlightElement.length === 0 ||
              globalHighlightElement.find((g) => g === group)),
          keys: keys ? keys : []
        };
      } else if (keys) {
        let newKeys = reduceUsedElements[group].keys.slice();
        keys.forEach((k) => {
          if (!newKeys.includes(k)) {
            newKeys.push(k);
          }
        });
        reduceUsedElements[group].keys = newKeys;
      }
    });

    let reduceNonMatches = {};
    nonMatches.forEach(({ group, item, value, keys, keyFromGroup }) => {
      if (!reduceNonMatches[group]) {
        reduceNonMatches[group] = {
          group,
          keyFromGroup,
          item,
          value,
          clicked: true,
          keys: keys ? keys : []
        };
      } else if (keys) {
        let newKeys = reduceNonMatches[group].keys.slice();
        keys.forEach((k) => {
          if (!newKeys.includes(k)) {
            newKeys.push(k);
          }
        });
        reduceNonMatches[group].keys = newKeys;
      }
    });

    let reduceModifiedMatches = {};

    setMyReduceModifiedMatches(reduceModifiedMatches);
    setMyReduceMatches(reduceMatches);
    setMyReduceUsedElements(reduceUsedElements);
    setMyReduceNonMatches(reduceNonMatches);

    Object.keys(reduceMatches).forEach((key) => {
      divRef.current.querySelectorAll(`.c-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
        el.style.background = reduceMatches[key].clicked
          ? (elementColorMap[key] && elementColorMap[key].color) ||
            "transparent"
          : "transparent";

        if (
          essentialData.personalSettings.showClaimElementKey &&
          reduceMatches[key].keyFromGroup &&
          reduceMatches[key].keys.length === 0 &&
          !el.innerHTML.includes("<small>")
        ) {
          el.innerHTML += `<small>${reduceMatches[key].keyFromGroup}</small>`;
        } else if (
          !essentialData.personalSettings.showClaimElementKey &&
          el.innerHTML.includes("<small>")
        ) {
          el.innerHTML = el.innerHTML.split("<small>")[0];
        }
      });
    });

    Object.keys(reduceUsedElements).forEach((key) => {
      divRef.current.querySelectorAll(`.u-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
        el.style.background = reduceUsedElements[key].clicked
          ? (elementColorMap[key] && elementColorMap[key].color) ||
            "transparent"
          : "transparent";

        if (
          essentialData.personalSettings.showClaimElementKey &&
          reduceUsedElements[key].keyFromGroup &&
          reduceUsedElements[key].keys.length === 0 &&
          !el.innerHTML.includes("<small>")
        ) {
          el.innerHTML += `<small>${reduceUsedElements[key].keyFromGroup}</small>`;
        } else if (
          !essentialData.personalSettings.showClaimElementKey &&
          el.innerHTML.includes("<small>")
        ) {
          el.innerHTML = el.innerHTML.split("<small>")[0];
        }
      });
    });

    Object.keys(reduceNonMatches).forEach((key) => {
      divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
        el.style.background = reduceNonMatches[key].clicked ? "red" : "inherit";

        if (
          reduceNonMatches[key].keyFromGroup &&
          reduceNonMatches[key].keys.length === 0 &&
          !el.innerHTML.includes("<small>")
        )
          el.innerHTML += `<small>${reduceNonMatches[key].keyFromGroup}</small>`;
      });
    });

    Object.keys(reduceModifiedMatches).forEach((key) => {
      divRef.current.querySelectorAll(`.m-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
        el.style.background = reduceModifiedMatches[key].clicked
          ? "hotpink"
          : "inherit";
      });
    });
  };

  /*
  useEffect(() => {
    // divRef.current.querySelector("h2").style.background = "rgb(147, 173, 100)";
    buildList(copyOfModifiedClaim, "");
    ReactTooltip.rebuild();
  }, [content, num, matches, copyOfModifiedClaim]);
  */

  useEffect(() => {
    // if (!modifiedClaim || searchStringPrev.current === searchString) {
    //   return;
    // }

    if (essentialData.personalSettings.readingModePureText) {
      divRef.current.querySelector(".content").innerHTML = content
        .split(`@##@`)
        .map((sentence, _iidd) => {
          if (_iidd !== 0) {
            return "&nbsp;".repeat(6) + sentence;
          }
          return sentence;
        })
        .join(`<br/>`);

      return;
    }

    if (searchString === "" /* && searchStringPrev.current !== searchString*/) {
      searchStringPrev.current = searchString;
      buildList(modifiedClaim, "");
      // console.log("No need to rebuild tooltip")
      ReactTooltip.rebuild();
      return;
    }

    searchStringPrev.current = searchString;
    // console.log("rebuildlist");
    const htmlReg = RegExp("<(\"[^\"]*\"|'[^']*'|[^'\">])*>", "g");
    let nonModifiedClaim = modifiedClaim.replaceAll(htmlReg, "@");
    let tagLists = [...modifiedClaim.matchAll(htmlReg)];

    tagLists.forEach((tagList, idx) => {
      for (let i = idx + 1; i < tagLists.length; i++) {
        tagLists[i].index -= tagList[0].length - 1;
      }
    });
    let insertLists = tagLists.map((tagList) => ({
      start: tagList.index,
      content: tagList[0]
    }));

    const searchStringMatches = [
      ...nonModifiedClaim.matchAll(
        RegExp(searchString.split("").join("@?"), "g")
      )
    ];
    setNumOfFoundedStr(searchStringMatches.length);

    searchStringMatches.forEach((mt) => {
      for (let j = mt.index; j < mt.index + mt[0].length; j++) {
        if (nonModifiedClaim[j] === "@") {
          continue;
        }
        insertLists.push({
          start: j,
          content: `<strong class='search-highlight'>${nonModifiedClaim[j]}</strong>`
        });
      }
    });

    insertLists.sort((a, b) => a.start - b.start);

    for (let i = insertLists.length - 1; i >= 0; i--) {
      nonModifiedClaim =
        nonModifiedClaim.slice(0, insertLists[i].start) +
        insertLists[i].content +
        nonModifiedClaim.slice(insertLists[i].start + 1);
    }
    //Test
    // if (index === 1) {
    //   console.log(insertLists);
    //   console.log nonModifiedClaim);
    //   debugger;
    // }
    buildList(modifiedClaim, nonModifiedClaim);
    ReactTooltip.rebuild();
  }, [
    searchString,
    content,
    num,
    matches,
    globalHighlightOn,
    globalHighlightElement,
    essentialData.personalSettings.showClaimElementKey,
    essentialData.personalSettings.synchronizeHighlight,
    essentialData.personalSettings.readingModePureText
  ]);

  const triggerToggleBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("c-") || allClasses[i].startsWith("u-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    toggleBtnColor(wantedClass.replace(/[cu]-/, ""));
  };

  const triggerToggleErrorBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("e-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    toggleErrorBtnColor(wantedClass.replace("e-", ""));
  };

  const triggerToggleModifiedBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("m-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    toggleModifiedBtnColor(wantedClass.replace("m-", ""));
  };

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceMatches).length > 0) {
      // console.log("add myReduceMatches eventListener...");
      Object.keys(myReduceMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.c-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleBtnColor);
          /*
          if (
            essentialData.personalSettings.showClaimElementKey &&
            myReduceMatches[key].keyFromGroup &&
            myReduceMatches[key].keys.length === 0 &&
            !el.innerHTML.includes("<small>")
          ) {
            el.innerHTML += `<small>${myReduceMatches[key].keyFromGroup}</small>`;
          } else if (
            !essentialData.personalSettings.showClaimElementKey &&
            el.innerHTML.includes("<small>")
          ) {
            el.innerHTML = el.innerHTML.split("<small>")[0];
          }
          */
        });
      });
      /* Object.keys(myReduceMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.u-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleBtnColor);
          if (myReduceMatches[key].keyFromGroup)
            el.innerHTML += `<small>${myReduceMatches[key].keyFromGroup}</small>`;
        });
      }); */
    }

    return () => {
      // console.log("remove myReduceMatches eventListener...");
      Object.keys(myReduceMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.c-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleBtnColor);
        });
      });
    };
  }, [myReduceMatches, essentialData.personalSettings.showClaimElementKey]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceUsedElements).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceUsedElements).forEach((key) => {
        divRefCurrent.querySelectorAll(`.u-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleBtnColor);
          /*
          if (
            essentialData.personalSettings.showClaimElementKey &&
            myReduceUsedElements[key].keyFromGroup &&
            myReduceUsedElements[key].keys.length === 0 &&
            !el.innerHTML.includes("<small>")
          ) {
            el.innerHTML += `<small>${myReduceUsedElements[key].keyFromGroup}</small>`;
          } else if (
            !essentialData.personalSettings.showClaimElementKey &&
            el.innerHTML.includes("<small>")
          ) {
            el.innerHTML = el.innerHTML.split("<small>")[0];
          }
          */
        });
      });
    }

    return () => {
      Object.keys(myReduceUsedElements).forEach((key) => {
        divRefCurrent.querySelectorAll(`.u-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleBtnColor);
        });
      });
    };
  }, [
    myReduceUsedElements,
    essentialData.personalSettings.showClaimElementKey
  ]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceNonMatches).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceNonMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.e-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleErrorBtnColor);
          /*
          if (
            myReduceNonMatches[key].keyFromGroup &&
            myReduceNonMatches[key].keys.length === 0 &&
            !el.innerHTML.includes("<small>")
          )
            el.innerHTML += `<small>${myReduceNonMatches[key].keyFromGroup}</small>`; */
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceNonMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.e-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleErrorBtnColor);
        });
      });
    };
  }, [myReduceNonMatches]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceModifiedMatches).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceModifiedMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.m-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleModifiedBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceModifiedMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.m-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleModifiedBtnColor);
        });
      });
    };
  }, [myReduceModifiedMatches]);

  const getTooltipContent = (_idx) => {
    if (!claimSearchPath) return "";

    const idx = parseInt(_idx);

    if (idx === 0 && type === "independent") {
      return "沒有對應的先前元件";
    }

    const showPartPrevContent = (pCtx, pStart, pEnd) => {
      const strOffset = 16;
      let frontStr, endStr;

      if (
        pCtx.slice(0, pStart).replaceAll(` `, "").replaceAll(`@##@`, ` `)
          .length <
        strOffset + 1
      ) {
        frontStr = pCtx.slice(0, pStart).replaceAll(`@##@`, ` `);
      } else {
        frontStr = pCtx
          .slice(0, pStart)
          .replaceAll(` `, "")
          .replaceAll(`@##@`, ` `);
        frontStr = "..." + frontStr.slice(-1 * strOffset);
      }

      if (
        pCtx.slice(pEnd).replaceAll(` `, "").replaceAll(`@##@`, ` `).length <
        strOffset + 1
      ) {
        endStr = pCtx.slice(pEnd).replaceAll(` `, "").replaceAll(`@##@`, ` `);
      } else {
        endStr = pCtx.slice(pEnd).replaceAll(` `, "").replaceAll(`@##@`, ` `);
        endStr = endStr.slice(0, strOffset) + "...";
      }

      return (
        frontStr +
        "<span style='color: lime; background: transparent; font-weight: 900'>" +
        pCtx.slice(pStart, pEnd) +
        "</span>" +
        endStr
      );
    };

    return claimSearchPath
      .map((path) => `搜尋路徑: ${[num, ...path].join(" -> ")}`)
      .map((ctx, pathIdx) => {
        const prevMatch = matches[idx]?.prevMatchPerPath[pathIdx];

        return `
        <p style="font-size: 1em; padding: 3px 0; margin: 0">
          ${ctx}<br/>
          先前元件所在請求項: ${prevMatch?.claimNum || "無"}<br/>
          先前元件: ${prevMatch?.value || "無"}<br/>
          先前內容: ${
            prevMatch?.claimNum && prevMatch?.start && prevMatch?.end
              ? showPartPrevContent(
                  allClaimContent[prevMatch.claimNum - 1],
                  prevMatch.start,
                  prevMatch.end
                )
              : "無"
          }<br/>
          <b style="color: orange;">★點擊兩下以修改構件名稱</b>           
        </p>`;
      })
      .join(``);
  };

  return (
    <div className="paragraph-container claim-container" ref={divRef}>
      <h2 onClick={() => setIsCollapse(index)}>
        {errors.length === 0 && <img src={checkedImg} alt="" />}
        {errors.length > 0 && <img src={errorImg} alt="" />}
        {`【請求項${num}】`}
        {type === "independent"
          ? "獨立項"
          : type === "additional"
          ? "附屬項"
          : "無法分析"}
        {searchString && (
          <>
            {numOfFoundedStr === 0 ? (
              <small>{" ".repeat(6)}無結果</small>
            ) : (
              <small>
                {" ".repeat(6)}搜尋結果:{numOfFoundedStr}筆
              </small>
            )}
          </>
        )}
        {!isCollapse ? (
          <span>&#x292C;</span>
        ) : (
          <span style={{ height: "1.38em", lineHeight: "1.25em" }}>
            &#x271B;
          </span>
        )}
      </h2>
      <section className={isCollapse ? "collapse" : ""}>
        {!essentialData.personalSettings.readingModePureText &&
          essentialData.personalSettings.synchronizeHighlight && (
            <p
              style={{
                color: "rgb(68 112 69)",
                fontWeight: "bold",
                marginLeft: "2.5vw",
                display: "flex"
              }}
            >
              <i style={{ fontStyle: "normal" }}>
                &#9733;說明書、申請專利範圍之所有構件皆同步highlight
              </i>
              {(!globalHighlightOn || globalHighlightElement.length > 0) && (
                <button
                  style={highlightButtonStyle}
                  onClick={() =>
                    setEssentialData((prev) => ({
                      ...prev,
                      globalHighlightOn: true,
                      globalHighlightElement: []
                    }))
                  }
                >
                  開啟標註
                </button>
              )}
              {globalHighlightOn && globalHighlightElement.length === 0 && (
                <button
                  style={highlightButtonStyle}
                  onClick={() =>
                    setEssentialData((prev) => ({
                      ...prev,
                      globalHighlightOn: false
                    }))
                  }
                >
                  關閉標註
                </button>
              )}
            </p>
          )}
        {essentialData.personalSettings.readingModePureText && (
          <p
            style={{
              color: "rgb(186 48 48)",
              fontWeight: "bold",
              marginLeft: "2.5vw"
            }}
          >
            &#9733;閱讀模式為純文字模式
          </p>
        )}
        <p className="content">分析內容中，請稍後......</p>
        {type !== "unknown" && (
          <ReactTooltip
            disable={!essentialData.personalSettings.openTooltip}
            id={`claim-${num}-prematch-tooltip`}
            delayShow={1000}
            html={true}
            getContent={(msg) => {
              if (msg === "yes")
                return `<p style="font-size: 1em;">本元件為主要構件</p>`;
              return getTooltipContent(msg);
            }}
          />
        )}
        <div className="paragraph-container-btns">
          <button
            className="gotop-btn"
            style={{ position: "relative" }}
            onClick={() =>
              document
                .querySelector(".main-body .main-body-grid-item:nth-of-type(2)")
                .scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            Go Top
          </button>
        </div>
      </section>
    </div>
  );
};

export default SingleClaimSimple;
