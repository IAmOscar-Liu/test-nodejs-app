import React, { useRef, useState, useEffect, useContext } from "react";
import ClaimEditingForm from "./ClaimEditingForm";
import checkedImg from "../assets/checked.png";
import errorImg from "../assets/error.png";
import modifyImg from "../assets/hammer.png";
import switchImg from "../assets/switch.png";
import ClaimPopup from "./ClaimPopup";
import { allThisWords } from "../dict/allThisWords";
import { stringToUnicode } from "../utils/stringToUnicode";
import { highlightClaimContent } from "../utils/modifyAllClaims";
import ReactTooltip from "react-tooltip";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";

const SingleClaim = ({
  index,
  num,
  type,
  allClaimContent,
  attemptAttaches,
  content,
  modifiedClaim,
  claimSearchPath,
  matches,
  usedElements,
  nonMatches,
  preUsedElementsNonUsed,
  errors,
  elementColorMap,
  isCollapse,
  setIsCollapse,
  setNewContent,
  setOldContent,
  setNewMatches,
  preSavedClaimNum,
  preSavedContent,
  preSavedMatches,
  handleSaveAll,
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

  const [copyOfModifiedClaim, setCopyOfModifiedClaim] = useState(modifiedClaim);
  const [copyOfSingleContent, setCopyOfSingleContent] = useState(
    preSavedContent || content
  );
  const [copyOfSingleNum, setCopyOfSingleNum] = useState(
    preSavedClaimNum || num
  );
  const [copyOfSingleMatches, setCopyOfSingleMatches] = useState(
    preSavedMatches || matches
  );
  const [onContentEditing, setOnContentEditing] = useState(false);
  const [editingZoneValue, setEditingZoneValue] = useState(
    preSavedContent || content
  );
  const [editingZoneNumlValue, setEditingZoneNumValue] = useState(
    preSavedClaimNum || num
  );

  // For popup
  const [isPopupOpen, toggleIsPopupOpen] = useState(false);
  const [popupStart, setPopupStart] = useState(-1);
  const [popupEnd, setPopupEnd] = useState(-1);
  const [popupIndex, setPopupIndex] = useState(-1);
  const [popupAvailableContent, setPopupAvailableContent] = useState(null);
  const [popupItem, setPopupItem] = useState("");
  const [popupFullValue, setPopupFullValue] = useState("");
  const [showControlBtns, setShowControlBtns] = useState(() => {
    const obj = {};
    obj[`paragraph-${index}-errors-btn`] = true;
    obj[`paragraph-${index}-corrects-btn`] = true;
    obj[`paragraph-${index}-modify-btn`] = true;

    return obj;
  });

  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );

  const areMatchesEqualByStartAndValue = (aMatches, bMatches) => {
    if (aMatches.length !== bMatches.length) return false;
    if (aMatches.length === 0 && bMatches.length === 0) return true;

    return aMatches.every(
      (a, aIdx) =>
        a.start === bMatches[aIdx].start && a.value === bMatches[aIdx].value
    );
  };

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

  const toggleAllBtnColor = () => {
    Object.keys(myReduceMatches).forEach((key) => {
      divRef.current.querySelectorAll(`.c-${key}`).forEach((el) => {
        el.style.background = myReduceMatches[key].clicked
          ? "inherit"
          : (elementColorMap[key] && elementColorMap[key].color) ||
            "transparent";
      });

      divRef.current.querySelectorAll(`.u-${key}`).forEach((el) => {
        el.style.background = myReduceMatches[key].clicked
          ? "inherit"
          : (elementColorMap[key] && elementColorMap[key].color) ||
            "transparent";
      });
    });

    const arrOfMyReduceMatches = Object.keys(myReduceMatches).map((key) => [
      key,
      {
        ...myReduceMatches[key],
        clicked: !myReduceMatches[key].clicked
      }
    ]);
    setMyReduceMatches(Object.fromEntries(arrOfMyReduceMatches));
    const arrOfMyReduceUsedElements = Object.keys(myReduceUsedElements).map(
      (key) => [
        key,
        {
          ...myReduceUsedElements[key],
          clicked: myReduceMatches[key]
            ? !myReduceUsedElements[key].clicked
            : myReduceUsedElements[key].clicked
        }
      ]
    );
    setMyReduceUsedElements(Object.fromEntries(arrOfMyReduceUsedElements));
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

  const toggleAllErrorBtnColor = () => {
    Object.keys(myReduceNonMatches).forEach((key) => {
      divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
        el.style.background = myReduceNonMatches[key].clicked
          ? "inherit"
          : "rgb(255,0,0)";
      });
    });
    const arrOfMyReduceNonMatches = Object.keys(myReduceNonMatches).map(
      (key) => [
        key,
        {
          ...myReduceNonMatches[key],
          clicked: !myReduceNonMatches[key].clicked
        }
      ]
    );
    setMyReduceNonMatches(Object.fromEntries(arrOfMyReduceNonMatches));
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
      `【請求項${num}${_modifiedClaim !== modifiedClaim ? ":已修正" : ""}】 ` +
      (_modifiedClaimWithSearchStr || _modifiedClaim)
        .split(`@##@`)
        .map((sentence, _iidd) => {
          if (_iidd !== 0) {
            return "&nbsp;".repeat(6) + sentence;
          }
          return sentence;
        })
        .join(`@##@`)
        .replaceAll(`@##@`, `<br/>`);

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
    if (copyOfSingleMatches) {
      copyOfSingleMatches
        .filter((mm) => mm.hasBeenModified)
        .forEach(({ group, value, item, keys }) => {
          if (!reduceModifiedMatches[group]) {
            reduceModifiedMatches[group] = {
              group,
              value,
              item,
              clicked: true,
              keys: keys ? keys : []
            };
          } else if (keys) {
            let newKeys = reduceModifiedMatches[group].keys.slice();
            keys.forEach((k) => {
              if (!newKeys.includes(k)) {
                newKeys.push(k);
              }
            });
            reduceModifiedMatches[group].keys = newKeys;
          }
        });
    }
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

    if (searchString === "" /* && searchStringPrev.current !== searchString*/) {
      searchStringPrev.current = searchString;
      buildList(copyOfModifiedClaim, "");
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
    buildList(copyOfModifiedClaim, nonModifiedClaim);
    ReactTooltip.rebuild();
  }, [
    searchString,
    content,
    num,
    matches,
    copyOfModifiedClaim,
    globalHighlightOn,
    globalHighlightElement,
    essentialData.personalSettings.showClaimElementKey,
    essentialData.personalSettings.synchronizeHighlight
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

  const triggerPopup = (event) => {
    const {
      elitem,
      elvalue,
      elfullvalue,
      start: _start,
      end: _end,
      realstart: _realstart,
      indexofmatch
    } = event.currentTarget.dataset;
    const start = parseInt(_start);
    const end = parseInt(_end);
    const valueEnd = start + elvalue.length;
    const realstart = parseInt(_realstart);
    setPopupStart(start);
    // setPopupEnd(end);
    setPopupEnd(valueEnd);
    setPopupIndex(parseInt(indexofmatch));
    setPopupItem(elitem);
    setPopupFullValue(elfullvalue === "none" ? "" : elfullvalue);
    setPopupAvailableContent(() => {
      // const nextStart = [...matches, ...usedElements, ...preUsedElementsNonUsed]
      const nextStart = [...matches, ...usedElements]
        .sort((a, b) => a.start - b.start)
        .find((mt) => (mt.realStart || mt.start) >= end);

      // console.log(nextStart);
      // debugger;

      let valueStartAt = start;
      if (realstart >= 0) {
        valueStartAt =
          realstart +
          content.slice(realstart).match(RegExp(allThisWords()))[0].length;
      }
      const frontStr = content.substring(valueStartAt, valueEnd);
      const availableStr = nextStart
        ? content.substring(valueEnd, nextStart.realStart || nextStart.start)
        : content.substring(valueEnd, content.length);
      const endStrMatch = availableStr.match(
        RegExp(
          "(@|、|，|、|，|-|；|:|,|。|/|\\\\|\\?|\\.|\\+|\\[|\\]|\\(|\\)|{|}|「|」)"
        )
      );
      if (endStrMatch) {
        return {
          startAt: valueStartAt,
          content: frontStr + availableStr.slice(0, endStrMatch.index)
        };
      } else {
        return {
          startAt: valueStartAt,
          content: frontStr + availableStr
        };
      }
    });
    toggleIsPopupOpen((prev) => !prev);
  };

  const handleUpdateMatch = (updateMatch) => {
    const newMatches = copyOfSingleMatches.map((match) => {
      if (match.indexOfMatch === updateMatch.popupIndex) {
        if (
          updateMatch.start === matches[updateMatch.popupIndex].start &&
          updateMatch.value === matches[updateMatch.popupIndex].value
        ) {
          return matches[updateMatch.popupIndex];
        }
        return {
          ...match,
          isInDescriptionOfElementMap: true,
          pathIsOK:
            type === "independent" && match.indexOfMatch === 0 ? true : false,
          preserveValue: updateMatch.preserveValue,
          hasBeenModified: true,
          isOK: true,
          prevMatchedElement: null,
          start: updateMatch.start,
          end: updateMatch.end,
          value: updateMatch.value,
          fullValue: updateMatch.fullValue,
          item: updateMatch.fullValue || updateMatch.value,
          group: stringToUnicode(updateMatch.fullValue || updateMatch.value),
          keyEnd: match.hasOuterKey ? match.keyEnd : null,
          keyStart: match.hasOuterKey ? match.keyStart : null,
          keys: match.hasOuterKey ? match.keys : null
        };
      }
      return match;
    });

    if (
      // JSON.stringify(matches) === JSON.stringify(newMatches)
      areMatchesEqualByStartAndValue(matches, newMatches)
    ) {
      setCopyOfSingleMatches(matches);
      setNewMatches(index, null);
      setCopyOfModifiedClaim(modifiedClaim);
    } else {
      setCopyOfSingleMatches(newMatches);
      setNewMatches(index, newMatches);

      const modifiedPreUsedElementsNonUsed = preUsedElementsNonUsed.filter(
        (plt) =>
          !newMatches.some((m) => !(plt.start >= m.end || plt.end <= m.start))
      );

      const newModifiedClaim = highlightClaimContent(
        {
          num,
          matches: newMatches,
          usedElements,
          // preUsedElementsNonUsed,
          preUsedElementsNonUsed: modifiedPreUsedElementsNonUsed,
          errors
        },
        content,
        elementColorMap
      );
      setCopyOfModifiedClaim(newModifiedClaim);
    }
  };

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceMatches).length > 0) {
      // console.log("add myReduceMatches eventListener...");
      Object.keys(myReduceMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.c-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleBtnColor);
          el.addEventListener("dblclick", triggerPopup);
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
          el.removeEventListener("dblclick", triggerPopup);
        });
      });
      /* Object.keys(myReduceMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.u-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleBtnColor);
          // el.removeEventListener("dblclick", triggerPopup);
        });
      }); */
    };
  }, [
    myReduceMatches,
    copyOfSingleMatches,
    essentialData.personalSettings.showClaimElementKey
  ]);

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
    copyOfSingleMatches,
    essentialData.personalSettings.showClaimElementKey
  ]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceNonMatches).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceNonMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.e-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleErrorBtnColor);
          el.addEventListener("dblclick", triggerPopup);
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
          el.removeEventListener("dblclick", triggerPopup);
        });
      });
    };
  }, [myReduceNonMatches, copyOfSingleMatches]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceModifiedMatches).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceModifiedMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.m-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleModifiedBtnColor);
          el.addEventListener("dblclick", triggerPopup);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceModifiedMatches).forEach((key) => {
        divRefCurrent.querySelectorAll(`.m-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleModifiedBtnColor);
          el.removeEventListener("dblclick", triggerPopup);
        });
      });
    };
  }, [myReduceModifiedMatches]);

  useEffect(() => {
    if (!preSavedContent && !preSavedClaimNum && !preSavedMatches) {
      setCopyOfSingleContent(content);
      setCopyOfSingleNum(num);
      setCopyOfSingleMatches(matches);
      setCopyOfModifiedClaim(modifiedClaim);
      setEditingZoneValue(content);
      setEditingZoneNumValue(num);
    }
  }, [preSavedContent, preSavedClaimNum, preSavedMatches]);

  // useEffect(() => {
  //   if (index === 0) {
  //     console.log("modifiedClaim change");
  //     console.log(modifiedClaim);
  //   }
  //   setCopyOfModifiedClaim(modifiedClaim);
  // }, [modifiedClaim]);

  const hasClaimBeenModified =
    copyOfSingleContent !== content ||
    copyOfSingleNum !== num ||
    // JSON.stringify(copyOfSingleMatches) !== JSON.stringify(matches);
    !areMatchesEqualByStartAndValue(copyOfSingleMatches, matches);

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
      <ClaimPopup
        isPopupOpen={isPopupOpen}
        popupIndex={popupIndex}
        toggleIsPopupOpen={toggleIsPopupOpen}
        popupStart={popupStart}
        popupEnd={popupEnd}
        setPopupStart={setPopupStart}
        setPopupEnd={setPopupEnd}
        popupAvailableContent={popupAvailableContent}
        popupFullValue={popupFullValue}
        popupItem={popupItem}
        handleUpdateMatch={handleUpdateMatch}
      />

      <h2
        style={hasClaimBeenModified ? { background: "hotpink" } : {}}
        onClick={() => setIsCollapse(index)}
      >
        {errors.length === 0 && <img src={checkedImg} alt="" />}
        {errors.length > 0 && <img src={errorImg} alt="" />}
        {hasClaimBeenModified
          ? `【請求項${copyOfSingleNum}】`
          : `【請求項${num}】`}
        {hasClaimBeenModified
          ? "已修正"
          : type === "independent"
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
        <p>
          請求項種類:{" "}
          {type === "independent"
            ? attemptAttaches.length > 0
              ? "引用記載形式之獨立項"
              : "獨立項"
            : type === "additional"
            ? attemptAttaches.length > 1
              ? "多項附屬項"
              : "附屬項"
            : "無法分析"}
        </p>
        {type === "independent" && attemptAttaches.length > 0 && (
          <p>
            引用記載之請求項:{" "}
            {attemptAttaches.map((attach) => attach).join("、")}
          </p>
        )}
        {type === "additional" && (
          <p>
            所依附請求項: {attemptAttaches.map((attach) => attach).join("、")}
          </p>
        )}
        {errors.length > 0 && (
          <div className="err-messages">
            <p>Errors: </p>
            <ul>
              {errors
                .reduce((a, e) => {
                  if (!a.find((m) => m.message === e.message)) {
                    return [...a, e];
                  }
                  return a;
                }, [])
                .map((err, iii) => (
                  <li key={iii}>
                    {iii + 1}. {err.message}
                  </li>
                ))}
            </ul>
          </div>
        )}
        {essentialData.dbResultMap &&
          Object.keys(essentialData.dbResultMap).length > 0 && (
            <p
              style={{
                color: "rgb(130 45 45)",
                fontWeight: "bold"
              }}
            >
              &#9733;連接資料庫以尋找請求項之構件
            </p>
          )}
        {Object.keys(myReduceMatches).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-corrects-btn`}
              type="checkbox"
            />
            <p className="disp">
              <img src={checkedImg} alt="" />
              元件見於本請求項先前內容或所依附的請求項
              <label htmlFor={`paragraph-${index}-corrects-btn`}>
                {showControlBtns[`paragraph-${index}-corrects-btn`] ? "⤬" : "✛"}
              </label>
            </p>
            {essentialData.personalSettings.synchronizeHighlight && (
              <p
                style={{
                  color: "rgb(68 112 69)",
                  fontWeight: "bold",
                  marginLeft: "2.5vw"
                }}
              >
                &#9733;說明書、申請專利範圍之所有構件皆同步標註
              </p>
            )}
          </>
        )}
        {Object.keys(myReduceMatches).length > 0 && (
          <div
            className="paragraph-corrects-btn"
            style={
              showControlBtns[`paragraph-${index}-corrects-btn`]
                ? {}
                : { display: "none" }
            }
          >
            {Object.keys(myReduceMatches).map((key) => (
              <button
                onClick={() => toggleBtnColor(key)}
                style={{
                  background: myReduceMatches[key].clicked
                    ? (elementColorMap[key] && elementColorMap[key].color) ||
                      "transparent"
                    : "inherit"
                }}
                key={key}
              >
                {myReduceMatches[key].item}
                {myReduceMatches[key].keys.join("、")}
                {essentialData.personalSettings.showClaimElementKey &&
                  myReduceMatches[key].keys.length === 0 &&
                  myReduceMatches[key].keyFromGroup && (
                    <small>{myReduceMatches[key].keyFromGroup}</small>
                  )}
              </button>
            ))}
            {!essentialData.personalSettings.synchronizeHighlight && (
              <button
                style={{
                  background: "rgb(68, 112, 69)",
                  borderRadius: 1000000
                }}
                onClick={toggleAllBtnColor}
              >
                <img
                  src={switchImg}
                  alt=""
                  style={{
                    width: 25,
                    height: 20,
                    transform: "translateY(3px)"
                  }}
                />
              </button>
            )}
            {essentialData.personalSettings.synchronizeHighlight &&
              (!globalHighlightOn || globalHighlightElement.length > 0) && (
                <button
                  style={{
                    background: "rgb(182 100 71)",
                    color: "#eee",
                    boxShadow: "none",
                    fontSize: "1.1em",
                    alignSelf: "flex-end",
                    marginLeft: "auto",
                    marginRight: "3vw"
                  }}
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
            {essentialData.personalSettings.synchronizeHighlight &&
              globalHighlightOn &&
              globalHighlightElement.length === 0 && (
                <button
                  style={{
                    background: "rgb(182 100 71)",
                    color: "#eee",
                    boxShadow: "none",
                    fontSize: "1.1em",
                    alignSelf: "flex-end",
                    marginLeft: "auto",
                    marginRight: "3vw"
                  }}
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
          </div>
        )}
        {Object.keys(myReduceNonMatches).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-errors-btn`}
              type="checkbox"
            />
            <p style={{ background: "rgb(188 30 30)" }} className="disp">
              <img src={errorImg} alt="" />
              {errors.find((e) => e.message.includes("標的名稱"))
                ? Object.keys(myReduceNonMatches).length === 1
                  ? "標的名稱錯誤"
                  : "標的名稱錯誤 & 元件未見於本請求項先前內容或所依附的請求項"
                : "元件未見於本請求項先前內容或所依附的請求項"}
              <label htmlFor={`paragraph-${index}-errors-btn`}>
                {showControlBtns[`paragraph-${index}-errors-btn`] ? "⤬" : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceNonMatches).length > 0 && (
          <div
            className="paragraph-errors-btn"
            style={
              showControlBtns[`paragraph-${index}-errors-btn`]
                ? {}
                : { display: "none" }
            }
          >
            {Object.keys(myReduceNonMatches).map((key) => (
              <button
                onClick={() => toggleErrorBtnColor(key)}
                style={{
                  background: myReduceNonMatches[key].clicked
                    ? "rgb(255, 0, 0)"
                    : "inherit"
                }}
                key={key}
              >
                {myReduceNonMatches[key].item}
                {myReduceNonMatches[key].keys.join("、")}
                {essentialData.personalSettings.showClaimElementKey &&
                  myReduceNonMatches[key].keys.length === 0 &&
                  myReduceNonMatches[key].keyFromGroup && (
                    <small>{myReduceNonMatches[key].keyFromGroup}</small>
                  )}
              </button>
            ))}
            <button
              style={{
                background: "rgb(255, 0, 0)",
                borderRadius: 1000000
              }}
              onClick={toggleAllErrorBtnColor}
            >
              <img
                src={switchImg}
                alt=""
                style={{ width: 25, height: 20, transform: "translateY(3px)" }}
              />
            </button>
          </div>
        )}
        {Object.keys(myReduceModifiedMatches).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-modify-btn`}
              type="checkbox"
            />
            <p style={{ background: "hotpink" }} className="disp">
              <img src={modifyImg} alt="" />
              已修正之元件
              <label htmlFor={`paragraph-${index}-modify-btn`}>
                {showControlBtns[`paragraph-${index}-modify-btn`] ? "⤬" : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceModifiedMatches).length > 0 && (
          <div
            className="paragraph-modify-btn"
            style={
              showControlBtns[`paragraph-${index}-modify-btn`]
                ? {}
                : { display: "none" }
            }
          >
            {Object.keys(myReduceModifiedMatches).map((key) => (
              <button
                onClick={() => toggleModifiedBtnColor(key)}
                key={key}
                style={{
                  background: myReduceModifiedMatches[key].clicked
                    ? "hotpink"
                    : "inherit"
                }}
              >
                {myReduceModifiedMatches[key].item}
                {myReduceModifiedMatches[key].keys.join("、")}
              </button>
            ))}
          </div>
        )}
        <p
          style={
            onContentEditing ||
            copyOfSingleContent !== content ||
            copyOfSingleNum !== num
              ? { display: "none" }
              : {}
          }
          className={`content ${
            copyOfModifiedClaim === modifiedClaim ? "" : "modify"
          }`}
        >
          分析內容中，請稍後......
        </p>
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
        {!onContentEditing &&
          (copyOfSingleContent !== content || copyOfSingleNum !== num) && (
            <p className="content modify">
              【請求項{copyOfSingleNum}:已修正】{" "}
              {
                copyOfSingleContent.split(`@##@`).map((sentence, _iidd) => {
                  if (_iidd !== 0) {
                    return (
                      <React.Fragment key={_iidd}>
                        <span style={{ backgroundColor: "initial" }}>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                        {sentence}
                        <br />
                      </React.Fragment>
                    );
                  }
                  return (
                    <React.Fragment key={_iidd}>
                      {sentence}
                      <br />
                    </React.Fragment>
                  );
                })
                //.join(`@##@`)
                // .replaceAll(`@##@`, `<br/>`)
                //.replaceAll(`@##@`, `<br/>`)
              }
            </p>
          )}
        {onContentEditing && (
          <p className="content">
            <label
              style={{
                minWidth: 300,
                display: "block",
                marginBottom: ".3em"
              }}
            >
              請求項編號:{" "}
              <input
                style={{
                  fontSize: "0.9em",
                  width: 100
                }}
                type="text"
                value={editingZoneNumlValue}
                disabled
              />
            </label>
            <ClaimEditingForm
              num={num}
              editingZoneValue={editingZoneValue}
              setEditingZoneValue={setEditingZoneValue}
            />
          </p>
        )}
        <div className="paragraph-container-btns">
          {hasClaimBeenModified && (
            <button
              onClick={() => {
                setCopyOfSingleContent(content);
                setCopyOfSingleNum(num);
                setCopyOfSingleMatches(matches);
                setCopyOfModifiedClaim(modifiedClaim);
                setOldContent(index);
                setOnContentEditing(false);
                setNewMatches(index, null);
              }}
            >
              還原
            </button>
          )}
          {onContentEditing &&
            (copyOfSingleContent !== editingZoneValue ||
              copyOfSingleNum !== editingZoneNumlValue) && (
              <button
                onClick={() => {
                  if (
                    editingZoneValue === content &&
                    editingZoneNumlValue === num
                  ) {
                    setOldContent(index);
                  } else {
                    setNewContent(
                      index,
                      editingZoneValue,
                      editingZoneNumlValue
                    );
                  }
                  setCopyOfSingleContent(editingZoneValue);
                  setCopyOfSingleNum(editingZoneNumlValue);
                  setCopyOfSingleMatches(matches);
                  setCopyOfModifiedClaim(modifiedClaim);
                  setOnContentEditing(false);
                }}
              >
                確認
              </button>
            )}
          <button
            onClick={() => {
              if (!onContentEditing) {
                setEditingZoneValue(copyOfSingleContent);
                setEditingZoneNumValue(copyOfSingleNum);
              }
              setOnContentEditing((prev) => !prev);
            }}
          >
            {onContentEditing ? `取消` : `修正`}
          </button>
          {hasClaimBeenModified && (
            <button onClick={handleSaveAll}>全部儲存</button>
          )}
          <button
            className="gotop-btn"
            onClick={() =>
              document
                .querySelector(".main-body")
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

export default SingleClaim;
