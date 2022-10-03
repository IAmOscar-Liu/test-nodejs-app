import React, { useRef, useState, useEffect, useContext } from "react";
import checkedImg from "../assets/checked.png";
import warningImg from "../assets/warn.png";
import errorImg from "../assets/error.png";
import switchImg from "../assets/switch.png";
import aboriginalImg from "../assets/aboriginal.png";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";

const SingleParagraph = ({
  index,
  isOK,
  dataType,
  applicationNum,
  general,
  content,
  modifiedParagraph,
  figureKeys,
  wrongFigureKeys,
  correctKeys,
  wrongKeys,
  potentialWrongKeys,
  wrongWordKeys,
  aboriginalWordKeys,
  elementColorMap,
  isCollapse,
  setIsCollapse,
  setNewContent,
  setOldContent,
  setDeleteContent,
  preSavedContent,
  preSavedGeneral,
  searchString,
  globalHighlightOn,
  globalHighlightElement
}) => {
  const divRef = useRef(null);
  const searchStringPrev = useRef(searchString);
  const [numOfFoundedStr, setNumOfFoundedStr] = useState(0);
  const [myReduceFigureKeys, setMyReduceFigureKeys] = useState({});
  const [myReduceWrongFigureKeys, setMyReduceWrongFigureKeys] = useState({});
  const [myReduceCorrectKeys, setMyReduceCorrectKeys] = useState({});
  const [myReduceWrongKeys, setMyReduceWrongKeys] = useState({});
  const [myReducePotentialWrongKeys, setMyReducePotentialWrongKeys] = useState(
    {}
  );
  const [myReduceWrongWordKeys, setMyReduceWrongWordKeys] = useState({});
  const [myReduceAboriginalWordKeys, setMyReduceAboriginalWordKeys] = useState(
    {}
  );

  const [copyOfSingleContent, setCopyOfSingleContent] = useState(
    preSavedContent || content
  );
  const [copyOfSingleGeneral, setCopyOfSingleGeneral] = useState(
    preSavedGeneral || general
  );
  const [onContentEditing, setOnContentEditing] = useState(false);
  const [editingZoneValue, setEditingZoneValue] = useState(
    preSavedContent || content
  );
  const [editingZoneGeneralValue, setEditingZoneGeneralValue] = useState(
    preSavedGeneral || general
  );
  const [showControlBtns, setShowControlBtns] = useState(() => {
    const obj = {};

    obj[`paragraph-${index}-figure-btn`] = true;
    obj[`paragraph-${index}-wrong-figure-btn`] = true;
    obj[`paragraph-${index}-potentialErrors-btn`] = true;
    obj[`paragraph-${index}-errors-btn`] = true;
    obj[`paragraph-${index}-word-errors-btn`] = true;
    obj[`paragraph-${index}-corrects-btn`] = true;
    obj[`paragraph-${index}-aboriginals-btn`] = true;

    return obj;
  });
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
        el.style.background = myReduceCorrectKeys[key].clicked
          ? "inherit"
          : elementColorMap[key].color;
      });

      setMyReduceCorrectKeys({
        ...myReduceCorrectKeys,
        [key]: {
          ...myReduceCorrectKeys[key],
          clicked: !myReduceCorrectKeys[key].clicked
        }
      });
    }
  };

  const toggleAllBtnColor = () => {
    Object.keys(myReduceCorrectKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.c-${key}`).forEach((el) => {
        el.style.background = myReduceCorrectKeys[key].clicked
          ? "inherit"
          : elementColorMap[key].color;
      });
    });
    const arrOfMyReduceCorrectKeys = Object.keys(myReduceCorrectKeys).map(
      (key) => [
        key,
        {
          ...myReduceCorrectKeys[key],
          clicked: !myReduceCorrectKeys[key].clicked
        }
      ]
    );
    setMyReduceCorrectKeys(Object.fromEntries(arrOfMyReduceCorrectKeys));
  };

  const toggleErrorBtnColor = (key) => {
    divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
      el.style.background = myReduceWrongKeys[key].clicked ? "inherit" : "red";
    });

    setMyReduceWrongKeys({
      ...myReduceWrongKeys,
      [key]: {
        ...myReduceWrongKeys[key],
        clicked: !myReduceWrongKeys[key].clicked
      }
    });
  };

  const toggleAllErrorBtnColor = () => {
    Object.keys(myReduceWrongKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
        el.style.background = myReduceWrongKeys[key].clicked
          ? "inherit"
          : "red";
      });
    });
    const arrOfMyReduceWrongKeys = Object.keys(myReduceWrongKeys).map((key) => [
      key,
      {
        ...myReduceWrongKeys[key],
        clicked: !myReduceWrongKeys[key].clicked
      }
    ]);
    setMyReduceWrongKeys(Object.fromEntries(arrOfMyReduceWrongKeys));
  };

  const toggleWrongWordBtnColor = (key) => {
    divRef.current.querySelectorAll(`.ew-${key}`).forEach((el) => {
      el.style.background = myReduceWrongWordKeys[key].clicked
        ? "inherit"
        : "red";
    });

    setMyReduceWrongWordKeys({
      ...myReduceWrongWordKeys,
      [key]: {
        ...myReduceWrongWordKeys[key],
        clicked: !myReduceWrongWordKeys[key].clicked
      }
    });
  };

  const toggleAllWrongWordBtnColor = () => {
    Object.keys(myReduceWrongWordKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.ew-${key}`).forEach((el) => {
        el.style.background = myReduceWrongWordKeys[key].clicked
          ? "inherit"
          : "red";
      });
    });
    const arrOfMyReduceWrongWordKeys = Object.keys(myReduceWrongWordKeys).map(
      (key) => [
        key,
        {
          ...myReduceWrongWordKeys[key],
          clicked: !myReduceWrongWordKeys[key].clicked
        }
      ]
    );
    setMyReduceWrongWordKeys(Object.fromEntries(arrOfMyReduceWrongWordKeys));
  };

  const toggleFigureBtnColor = (key) => {
    divRef.current.querySelectorAll(`.f-${key}`).forEach((el) => {
      el.style.background = myReduceFigureKeys[key].clicked
        ? "inherit"
        : "#93ad64";
    });

    setMyReduceFigureKeys({
      ...myReduceFigureKeys,
      [key]: {
        ...myReduceFigureKeys[key],
        clicked: !myReduceFigureKeys[key].clicked
      }
    });
  };

  const toggleAllFigureBtnColor = () => {
    Object.keys(myReduceFigureKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.f-${key}`).forEach((el) => {
        el.style.background = myReduceFigureKeys[key].clicked
          ? "inherit"
          : "#93ad64";
      });
    });
    const arrOfMyReduceFigureKeys = Object.keys(myReduceFigureKeys).map(
      (key) => [
        key,
        {
          ...myReduceFigureKeys[key],
          clicked: !myReduceFigureKeys[key].clicked
        }
      ]
    );
    setMyReduceFigureKeys(Object.fromEntries(arrOfMyReduceFigureKeys));
  };

  const toggleWrongFigureBtnColor = (key) => {
    divRef.current.querySelectorAll(`.ef-${key}`).forEach((el) => {
      el.style.background = myReduceWrongFigureKeys[key].clicked
        ? "inherit"
        : "red";
    });

    setMyReduceWrongFigureKeys({
      ...myReduceWrongFigureKeys,
      [key]: {
        ...myReduceWrongFigureKeys[key],
        clicked: !myReduceWrongFigureKeys[key].clicked
      }
    });
  };

  const toggleAllWrongFigureBtnColor = () => {
    Object.keys(myReduceWrongFigureKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.ef-${key}`).forEach((el) => {
        el.style.background = myReduceWrongFigureKeys[key].clicked
          ? "inherit"
          : "red";
      });
    });
    const arrOfMyReduceWrongFigureKeys = Object.keys(
      myReduceWrongFigureKeys
    ).map((key) => [
      key,
      {
        ...myReduceWrongFigureKeys[key],
        clicked: !myReduceWrongFigureKeys[key].clicked
      }
    ]);
    setMyReduceWrongFigureKeys(
      Object.fromEntries(arrOfMyReduceWrongFigureKeys)
    );
  };

  const toggleAboriginalWordBtnColor = (key) => {
    divRef.current.querySelectorAll(`.ab-${key}`).forEach((el) => {
      el.style.background = myReduceAboriginalWordKeys[key].clicked
        ? "inherit"
        : "rgb(188, 174, 174)";
    });

    setMyReduceAboriginalWordKeys({
      ...myReduceAboriginalWordKeys,
      [key]: {
        ...myReduceAboriginalWordKeys[key],
        clicked: !myReduceAboriginalWordKeys[key].clicked
      }
    });
  };

  const toggleAllAboriginalWordBtnColor = () => {
    Object.keys(myReduceAboriginalWordKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.ab-${key}`).forEach((el) => {
        el.style.background = myReduceAboriginalWordKeys[key].clicked
          ? "inherit"
          : "rgb(188, 174, 174)";
      });
    });
    const arrOfMyReduceAboriginalWordKeys = Object.keys(
      myReduceAboriginalWordKeys
    ).map((key) => [
      key,
      {
        ...myReduceAboriginalWordKeys[key],
        clicked: !myReduceAboriginalWordKeys[key].clicked
      }
    ]);
    setMyReduceAboriginalWordKeys(
      Object.fromEntries(arrOfMyReduceAboriginalWordKeys)
    );
  };

  const togglePotentialErrorBtnColor = (key) => {
    divRef.current.querySelectorAll(`.pe-${key}`).forEach((el) => {
      el.style.background = myReducePotentialWrongKeys[key].clicked
        ? "inherit"
        : "rgb(202 117 117)";
      el.style.fontStyle = myReducePotentialWrongKeys[key].clicked
        ? "normal"
        : "italic";
    });

    setMyReducePotentialWrongKeys({
      ...myReducePotentialWrongKeys,
      [key]: {
        ...myReducePotentialWrongKeys[key],
        clicked: !myReducePotentialWrongKeys[key].clicked
      }
    });
  };

  const toggleAllPotentialErrorBtnColor = () => {
    Object.keys(myReducePotentialWrongKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.pe-${key}`).forEach((el) => {
        el.style.background = myReducePotentialWrongKeys[key].clicked
          ? "inherit"
          : "rgb(202 117 117)";
        el.style.fontStyle = myReducePotentialWrongKeys[key].clicked
          ? "normal"
          : "italic";
      });
    });
    const arrOfMyReducePotentialErrorKeys = Object.keys(
      myReducePotentialWrongKeys
    ).map((key) => [
      key,
      {
        ...myReducePotentialWrongKeys[key],
        clicked: !myReducePotentialWrongKeys[key].clicked
      }
    ]);
    setMyReducePotentialWrongKeys(
      Object.fromEntries(arrOfMyReducePotentialErrorKeys)
    );
  };

  const buildList = (modifiedParagraphWithSearchStr) => {
    // Test
    // if (general === "0005") {
    //   console.log("rebuild list");
    //   console.log(globalHighlightElement);
    // }

    divRef.current.querySelector(".content").innerHTML = `【${general}】 ${
      modifiedParagraphWithSearchStr || modifiedParagraph
    }`;

    let reduceFigureKeys = {};
    figureKeys.forEach((figureKey) => {
      if (!reduceFigureKeys[figureKey.group]) {
        reduceFigureKeys[figureKey.group] = {
          ...figureKey,
          clicked: true
        };
      }
    });

    let reduceWrongFigureKeys = {};
    wrongFigureKeys.forEach((wrongFigureKey) => {
      if (!reduceWrongFigureKeys[wrongFigureKey.group]) {
        reduceWrongFigureKeys[wrongFigureKey.group] = {
          ...wrongFigureKey,
          clicked: true
        };
      }
    });

    let reduceCorrectKeys = {};
    correctKeys.forEach((correctKey) => {
      if (reduceCorrectKeys[correctKey.group]) {
        const currentKeys = correctKey.keys;
        currentKeys.forEach((key) => {
          if (!reduceCorrectKeys[correctKey.group].keys.includes(key)) {
            reduceCorrectKeys[correctKey.group].keys.push(key);
            reduceCorrectKeys[correctKey.group] = {
              ...correctKey,
              value:
                correctKey.item +
                reduceCorrectKeys[correctKey.group].keys
                  .filter((k) => k !== "")
                  .join("、"),
              keys: reduceCorrectKeys[correctKey.group].keys,
              // clicked: true
              clicked:
                globalHighlightOn &&
                (globalHighlightElement.length === 0 ||
                  globalHighlightElement.find((g) => g === correctKey.group))
            };
          }
        });
      } else {
        reduceCorrectKeys[correctKey.group] = {
          ...correctKey,
          value:
            correctKey.item +
            correctKey.keys.filter((k) => k !== "").join("、"),
          // clicked: true
          clicked:
            globalHighlightOn &&
            (globalHighlightElement.length === 0 ||
              globalHighlightElement.find((g) => g === correctKey.group))
        };
      }
    });

    let reduceWrongKeys = {};
    wrongKeys.forEach((wrongKey) => {
      if (reduceWrongKeys[wrongKey.group]) {
        const currentKeys = wrongKey.wrongKeys;
        currentKeys.forEach((key) => {
          if (!reduceWrongKeys[wrongKey.group].wrongKeys.includes(key)) {
            reduceWrongKeys[wrongKey.group].wrongKeys.push(key);
            reduceWrongKeys[wrongKey.group] = {
              ...wrongKey,
              value:
                wrongKey.item +
                reduceWrongKeys[wrongKey.group].wrongKeys
                  .filter((k) => k !== "")
                  .join("、"),
              wrongKeys: reduceWrongKeys[wrongKey.group].wrongKeys,
              clicked: true
            };
          }
        });
      } else {
        reduceWrongKeys[wrongKey.group] = {
          ...wrongKey,
          value:
            wrongKey.item +
            wrongKey.wrongKeys.filter((k) => k !== "").join("、"),
          clicked: true
        };
      }
    });

    let reducePotentialWrongKeys = {};
    potentialWrongKeys.forEach((potentialWrongKey) => {
      if (reducePotentialWrongKeys[potentialWrongKey.group]) {
        const currentKeys = potentialWrongKey.keys;
        currentKeys.forEach((key) => {
          if (
            !reducePotentialWrongKeys[potentialWrongKey.group].keys.includes(
              key
            )
          ) {
            reducePotentialWrongKeys[potentialWrongKey.group].keys.push(key);
            reducePotentialWrongKeys[potentialWrongKey.group] = {
              ...potentialWrongKey,
              value:
                potentialWrongKey.item /*+
                reducePotentialWrongKeys[potentialWrongKey.group].keys
                  .filter((k) => k !== "")
                  .join("、")*/,
              keys: reducePotentialWrongKeys[potentialWrongKey.group].keys,
              clicked: true
            };
          }
        });
      } else {
        reducePotentialWrongKeys[potentialWrongKey.group] = {
          ...potentialWrongKey,
          value:
            potentialWrongKey.item /*+
            potentialWrongKey.keys.filter((k) => k !== "").join("、")*/,
          clicked: true
        };
      }
    });

    let reduceWrongWordKeys = {};
    wrongWordKeys.forEach((wrongWordKey) => {
      if (!reduceWrongWordKeys[wrongWordKey.group]) {
        reduceWrongWordKeys[wrongWordKey.group] = {
          ...wrongWordKey,
          clicked: true
        };
      }
    });

    let reduceAboriginalWordKeys = {};
    aboriginalWordKeys.forEach((aboriginalWordKey) => {
      if (!reduceAboriginalWordKeys[aboriginalWordKey.group]) {
        reduceAboriginalWordKeys[aboriginalWordKey.group] = {
          ...aboriginalWordKey,
          clicked: true
        };
      }
    });

    setMyReduceCorrectKeys(reduceCorrectKeys);
    setMyReduceWrongKeys(reduceWrongKeys);
    setMyReducePotentialWrongKeys(reducePotentialWrongKeys);
    setMyReduceWrongWordKeys(reduceWrongWordKeys);
    setMyReduceAboriginalWordKeys(reduceAboriginalWordKeys);
    setMyReduceFigureKeys(reduceFigureKeys);
    setMyReduceWrongFigureKeys(reduceWrongFigureKeys);

    Object.keys(reduceCorrectKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.c-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
        el.style.background = reduceCorrectKeys[key].clicked
          ? elementColorMap[key].color
          : "inherit";
      });
    });

    Object.keys(reduceWrongKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
      });
    });
    Object.keys(reducePotentialWrongKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.pe-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
      });
    });
    Object.keys(reduceWrongWordKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.ew-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
      });
    });
    Object.keys(reduceAboriginalWordKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.ab-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
      });
    });
    Object.keys(reduceFigureKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.f-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
      });
    });
    Object.keys(reduceWrongFigureKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.ef-${key}`).forEach((el) => {
        el.style.cursor = "pointer";
      });
    });
  };
  /*
  useEffect(() => {
    // console.log("useEffect~~~~");

    // divRef.current.querySelector("h2").style.background =
    //   "rgb(147, 173, 100)";
    buildList("");
  }, [content, general]);
  */

  useEffect(() => {
    // if (!modifiedParagraph || searchStringPrev.current === searchString) {
    //   return;
    // }

    if (
      searchString === "" /* && searchStringPrev.current !== searchString */
    ) {
      searchStringPrev.current = searchString;
      return buildList("");
    }

    searchStringPrev.current = searchString;
    // console.log("rebuildlist");
    const htmlReg = RegExp("<(\"[^\"]*\"|'[^']*'|[^'\">])*>", "g");
    let nonModifiedParagraph = modifiedParagraph.replaceAll(htmlReg, "@");
    let tagLists = [...modifiedParagraph.matchAll(htmlReg)];
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
      ...nonModifiedParagraph.matchAll(
        RegExp(searchString.split("").join("@?"), "g")
      )
    ];
    setNumOfFoundedStr(searchStringMatches.length);

    searchStringMatches.forEach((mt) => {
      for (let j = mt.index; j < mt.index + mt[0].length; j++) {
        if (nonModifiedParagraph[j] === "@") {
          continue;
        }
        insertLists.push({
          start: j,
          content: `<strong class='search-highlight'>${nonModifiedParagraph[j]}</strong>`
        });
      }
    });

    insertLists.sort((a, b) => a.start - b.start);

    for (let i = insertLists.length - 1; i >= 0; i--) {
      nonModifiedParagraph =
        nonModifiedParagraph.slice(0, insertLists[i].start) +
        insertLists[i].content +
        nonModifiedParagraph.slice(insertLists[i].start + 1);
    }
    // Test
    // if (index === 0) {
    //   console.log(insertLists);
    //   console.log(nonModifiedParagraph);
    //   debugger;
    // }
    buildList(nonModifiedParagraph);
  }, [
    searchString,
    content,
    general,
    globalHighlightOn,
    globalHighlightElement,
    essentialData.personalSettings.synchronizeHighlight
  ]);

  const triggerToggleBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("c-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    if (wantedClass) toggleBtnColor(wantedClass.replace("c-", ""));
  };

  const triggerToggleErrorBtnColor = (e) => {
    console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("e-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    if (wantedClass) toggleErrorBtnColor(wantedClass.replace("e-", ""));
  };

  const triggerTogglePotentialErrorBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("pe-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    if (wantedClass)
      togglePotentialErrorBtnColor(wantedClass.replace("pe-", ""));
  };

  const triggerToggleWrongWordBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("ew-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    if (wantedClass) toggleWrongWordBtnColor(wantedClass.replace("ew-", ""));
  };

  const triggerToggleFigureBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("f-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    if (wantedClass) toggleFigureBtnColor(wantedClass.replace("f-", ""));
  };

  const triggerToggleWrongFigureBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("ef-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    if (wantedClass) toggleWrongFigureBtnColor(wantedClass.replace("ef-", ""));
  };

  const triggerToggleAboriginalWordBtnColor = (e) => {
    // console.log(e.target.classList);
    const allClasses = e.target.classList;
    let wantedClass;
    for (let i = 0; i < allClasses.length; i++) {
      if (allClasses[i].startsWith("ab-")) {
        wantedClass = allClasses[i];
        break;
      }
    }
    // console.log(wantedClass);
    if (wantedClass)
      toggleAboriginalWordBtnColor(wantedClass.replace("ab-", ""));
  };

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceCorrectKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceCorrectKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.c-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceCorrectKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.c-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleBtnColor);
        });
      });
    };
  }, [myReduceCorrectKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceWrongKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.e-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleErrorBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.e-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleErrorBtnColor);
        });
      });
    };
  }, [myReduceWrongKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReducePotentialWrongKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReducePotentialWrongKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.pe-${key}`).forEach((el) => {
          el.addEventListener("click", triggerTogglePotentialErrorBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReducePotentialWrongKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.pe-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerTogglePotentialErrorBtnColor);
        });
      });
    };
  }, [myReducePotentialWrongKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceWrongWordKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongWordKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ew-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleWrongWordBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongWordKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ew-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleWrongWordBtnColor);
        });
      });
    };
  }, [myReduceWrongWordKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceAboriginalWordKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceAboriginalWordKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ab-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleAboriginalWordBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceAboriginalWordKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ab-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleAboriginalWordBtnColor);
        });
      });
    };
  }, [myReduceAboriginalWordKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceWrongWordKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongWordKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ew-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleWrongWordBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongWordKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ew-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleWrongWordBtnColor);
        });
      });
    };
  }, [myReduceWrongWordKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceFigureKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceFigureKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.f-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleFigureBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceFigureKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.f-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleFigureBtnColor);
        });
      });
    };
  }, [myReduceFigureKeys]);

  useEffect(() => {
    const divRefCurrent = divRef.current;

    if (Object.keys(myReduceWrongFigureKeys).length > 0) {
      // console.log("add myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongFigureKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ef-${key}`).forEach((el) => {
          el.addEventListener("click", triggerToggleWrongFigureBtnColor);
        });
      });
    }

    return () => {
      // console.log("remove myReduceNonMatches eventListener...");
      Object.keys(myReduceWrongFigureKeys).forEach((key) => {
        divRefCurrent.querySelectorAll(`.ef-${key}`).forEach((el) => {
          el.removeEventListener("click", triggerToggleWrongFigureBtnColor);
        });
      });
    };
  }, [myReduceWrongFigureKeys]);

  useEffect(() => {
    if (preSavedContent === null && preSavedGeneral === null) {
      setCopyOfSingleContent(content);
      setCopyOfSingleGeneral(general);
      setEditingZoneValue(content);
      setEditingZoneGeneralValue(general);
    }
  }, [preSavedContent, preSavedGeneral]);

  return (
    <div className="paragraph-container not-claim" ref={divRef}>
      <h2
        style={
          copyOfSingleContent !== content || copyOfSingleGeneral !== general
            ? { background: "hotpink" }
            : {}
        }
        onClick={() => setIsCollapse(index)}
      >
        {Object.keys(myReduceWrongKeys).length === 0 &&
          Object.keys(myReducePotentialWrongKeys).length === 0 &&
          Object.keys(myReduceWrongWordKeys).length === 0 &&
          Object.keys(myReduceWrongFigureKeys).length === 0 && (
            <img src={checkedImg} alt="" />
          )}
        {(Object.keys(myReduceWrongKeys).length > 0 ||
          Object.keys(myReduceWrongWordKeys).length > 0 ||
          Object.keys(myReduceWrongFigureKeys).length > 0) && (
          <img src={errorImg} alt="" />
        )}
        {Object.keys(myReducePotentialWrongKeys).length > 0 && (
          <img src={warningImg} alt="" />
        )}
        {Object.keys(myReduceAboriginalWordKeys).length > 0 && (
          <img src={aboriginalImg} alt="" />
        )}
        {dataType === "disclosure"
          ? applicationNum[3] === "1"
            ? "發明內容"
            : "新型內容"
          : "實施方式"}
        【
        {copyOfSingleContent !== content || copyOfSingleGeneral !== general
          ? `${copyOfSingleGeneral}已修正`
          : general}
        】
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
        {Object.keys(myReduceCorrectKeys).length > 0 && (
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
              元件名稱 & 符號正確:
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
                &#9733;說明書、申請專利範圍之所有構件皆同步highlight
              </p>
            )}
          </>
        )}
        {Object.keys(myReduceCorrectKeys).length > 0 && (
          <div
            className="paragraph-corrects-btn"
            style={
              showControlBtns[`paragraph-${index}-corrects-btn`]
                ? {}
                : { display: "none" }
            }
          >
            {Object.keys(myReduceCorrectKeys).map((key) => (
              <button
                onClick={() => toggleBtnColor(key)}
                style={{
                  background: myReduceCorrectKeys[key].clicked
                    ? elementColorMap[key].color
                    : "inherit"
                }}
                key={key}
                id={`para-${index}-${key}`}
              >
                {myReduceCorrectKeys[key].value}
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
        {Object.keys(myReduceWrongKeys).length > 0 && (
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
              元件名稱 or 符號錯誤:
              <label htmlFor={`paragraph-${index}-errors-btn`}>
                {showControlBtns[`paragraph-${index}-errors-btn`] ? "⤬" : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceWrongKeys).length > 0 && (
          <div
            style={
              showControlBtns[`paragraph-${index}-errors-btn`]
                ? {}
                : { display: "none" }
            }
            className="paragraph-errors-btn"
          >
            {Object.keys(myReduceWrongKeys).map((key) => (
              <button
                onClick={() => toggleErrorBtnColor(key)}
                style={{
                  background: myReduceWrongKeys[key].clicked ? "red" : "inherit"
                }}
                key={key}
              >
                {myReduceWrongKeys[key].value}
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
        {Object.keys(myReducePotentialWrongKeys).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-potentialErrors-btn`}
              type="checkbox"
            />
            <p style={{ background: "rgb(237 172 55)" }} className="disp">
              <img src={warningImg} alt="" />
              元件名稱 or 符號可能存在錯誤:
              <label htmlFor={`paragraph-${index}-potentialErrors-btn`}>
                {showControlBtns[`paragraph-${index}-potentialErrors-btn`]
                  ? "⤬"
                  : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReducePotentialWrongKeys).length > 0 && (
          <div
            style={
              showControlBtns[`paragraph-${index}-potentialErrors-btn`]
                ? {}
                : { display: "none" }
            }
            className="paragraph-potentialErrors-btn"
          >
            {Object.keys(myReducePotentialWrongKeys).map((key) => (
              <button
                onClick={() => togglePotentialErrorBtnColor(key)}
                style={{
                  background: myReducePotentialWrongKeys[key].clicked
                    ? "rgb(202 117 117)"
                    : "inherit"
                }}
                key={key}
              >
                {myReducePotentialWrongKeys[key].value}
              </button>
            ))}
            <button
              style={{
                background: "rgb(202 117 117)",
                borderRadius: 1000000
              }}
              onClick={toggleAllPotentialErrorBtnColor}
            >
              <img
                src={switchImg}
                alt=""
                style={{ width: 25, height: 20, transform: "translateY(3px)" }}
              />
            </button>
          </div>
        )}
        {Object.keys(myReduceWrongWordKeys).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-word-errors-btn`}
              type="checkbox"
            />
            <p style={{ background: "rgb(188 30 30)" }} className="disp">
              <img src={errorImg} alt="" />
              用語錯誤:
              <label htmlFor={`paragraph-${index}-word-errors-btn`}>
                {showControlBtns[`paragraph-${index}-word-errors-btn`]
                  ? "⤬"
                  : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceWrongWordKeys).length > 0 && (
          <div
            style={
              showControlBtns[`paragraph-${index}-word-errors-btn`]
                ? {}
                : { display: "none" }
            }
            className="paragraph-word-errors-btn"
          >
            {Object.keys(myReduceWrongWordKeys).map((key) => (
              <button
                onClick={() => toggleWrongWordBtnColor(key)}
                style={{
                  background: myReduceWrongWordKeys[key].clicked
                    ? "red"
                    : "inherit"
                }}
                key={key}
              >
                {myReduceWrongWordKeys[key].value}
              </button>
            ))}
            <button
              style={{ background: "red", borderRadius: 1000000 }}
              onClick={toggleAllWrongWordBtnColor}
            >
              <img
                src={switchImg}
                alt=""
                style={{ width: 25, height: 20, transform: "translateY(3px)" }}
              />
            </button>
          </div>
        )}
        {Object.keys(myReduceFigureKeys).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-figure-btn`}
              type="checkbox"
            />
            <p style={{ background: "#447045" }} className="disp">
              <img src={checkedImg} alt="" />
              引用正確之圖式:
              <label htmlFor={`paragraph-${index}-figure-btn`}>
                {showControlBtns[`paragraph-${index}-figure-btn`] ? "⤬" : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceFigureKeys).length > 0 && (
          <div
            style={
              showControlBtns[`paragraph-${index}-figure-btn`]
                ? {}
                : { display: "none" }
            }
            className="paragraph-figure-btn"
          >
            {Object.keys(myReduceFigureKeys).map((key) => (
              <button
                onClick={() => toggleFigureBtnColor(key)}
                style={{
                  background: myReduceFigureKeys[key].clicked
                    ? "#93ad64"
                    : "inherit"
                }}
                key={key}
              >
                {myReduceFigureKeys[key].fig}
              </button>
            ))}
            <button
              style={{ background: "#93ad64", borderRadius: 1000000 }}
              onClick={toggleAllFigureBtnColor}
            >
              <img
                src={switchImg}
                alt=""
                style={{ width: 25, height: 20, transform: "translateY(3px)" }}
              />
            </button>
          </div>
        )}
        {Object.keys(myReduceWrongFigureKeys).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-wrong-figure-btn`}
              type="checkbox"
            />
            <p style={{ background: "rgb(188, 30, 30)" }} className="disp">
              <img src={errorImg} alt="" />
              引用錯誤之圖式:
              <label htmlFor={`paragraph-${index}-wrong-figure-btn`}>
                {showControlBtns[`paragraph-${index}-wrong-figure-btn`]
                  ? "⤬"
                  : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceWrongFigureKeys).length > 0 && (
          <div
            style={
              showControlBtns[`paragraph-${index}-wrong-figure-btn`]
                ? {}
                : { display: "none" }
            }
            className="paragraph-wrong-figure-btn"
          >
            {Object.keys(myReduceWrongFigureKeys).map((key) => (
              <button
                onClick={() => toggleWrongFigureBtnColor(key)}
                style={{
                  background: myReduceWrongFigureKeys[key].clicked
                    ? "red"
                    : "inherit"
                }}
                key={key}
              >
                {myReduceWrongFigureKeys[key].fig}
              </button>
            ))}
            <button
              style={{ background: "red", borderRadius: 1000000 }}
              onClick={toggleAllWrongFigureBtnColor}
            >
              <img
                src={switchImg}
                alt=""
                style={{ width: 25, height: 20, transform: "translateY(3px)" }}
              />
            </button>
          </div>
        )}
        {Object.keys(myReduceAboriginalWordKeys).length > 0 && (
          <>
            <input
              onChange={(e) =>
                setShowControlBtns((prev) => ({
                  ...prev,
                  [e.target.id]: !prev[e.target.id]
                }))
              }
              id={`paragraph-${index}-aboriginals-btn`}
              type="checkbox"
            />
            <p style={{ background: "rgb(159 152 152)" }} className="disp">
              <img src={aboriginalImg} alt="" />
              原住民之相關用語:
              <label htmlFor={`paragraph-${index}-aboriginals-btn`}>
                {showControlBtns[`paragraph-${index}-aboriginals-btn`]
                  ? "⤬"
                  : "✛"}
              </label>
            </p>
          </>
        )}
        {Object.keys(myReduceAboriginalWordKeys).length > 0 && (
          <div
            style={
              showControlBtns[`paragraph-${index}-aboriginals-btn`]
                ? {}
                : { display: "none" }
            }
            className="paragraph-aboriginals-btn"
          >
            {Object.keys(myReduceAboriginalWordKeys).map((key) => (
              <button
                onClick={() => toggleAboriginalWordBtnColor(key)}
                style={{
                  background: myReduceAboriginalWordKeys[key].clicked
                    ? "rgb(188 174 174)"
                    : "inherit"
                }}
                key={key}
              >
                {myReduceAboriginalWordKeys[key].value}
              </button>
            ))}
            <button
              style={{ background: "rgb(188 174 174)", borderRadius: 1000000 }}
              onClick={toggleAllAboriginalWordBtnColor}
            >
              <img
                src={switchImg}
                alt=""
                style={{ width: 25, height: 20, transform: "translateY(3px)" }}
              />
            </button>
          </div>
        )}
        <p
          style={
            onContentEditing ||
            copyOfSingleContent !== content ||
            copyOfSingleGeneral !== general
              ? { display: "none" }
              : {}
          }
          className="content"
        >
          Sorry! 無法分析本段落!!!
        </p>
        {!onContentEditing &&
          (copyOfSingleContent !== content ||
            copyOfSingleGeneral !== general) && (
            <p className="content modify">{`【${copyOfSingleGeneral}:已修正】 ${copyOfSingleContent}`}</p>
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
              段落編號:{" "}
              <input
                style={{
                  fontSize: "0.9em",
                  width: 100
                }}
                type="text"
                value={editingZoneGeneralValue}
                onChange={(e) => setEditingZoneGeneralValue(e.target.value)}
              />
            </label>
            <textarea
              style={{
                width: "100%",
                height: 150,
                fontSize: "1.1em"
              }}
              value={editingZoneValue}
              onChange={(e) => setEditingZoneValue(e.target.value)}
            />
          </p>
        )}
        <div className="paragraph-container-btns">
          {(copyOfSingleContent !== content ||
            copyOfSingleGeneral !== general) && (
            <button
              onClick={() => {
                setCopyOfSingleContent(content);
                setCopyOfSingleGeneral(general);
                setOldContent(index);
                setOnContentEditing(false);
              }}
            >
              還原
            </button>
          )}
          {onContentEditing &&
            (copyOfSingleContent !== editingZoneValue ||
              copyOfSingleGeneral !== editingZoneGeneralValue) && (
              <button
                onClick={() => {
                  if (
                    editingZoneValue === content &&
                    editingZoneGeneralValue === general
                  ) {
                    setOldContent(index);
                  } else {
                    try {
                      setNewContent(
                        index,
                        editingZoneValue,
                        editingZoneGeneralValue
                      );
                    } catch (error) {
                      window.alert(error.message);
                      return;
                    }
                  }
                  setCopyOfSingleContent(editingZoneValue);
                  setCopyOfSingleGeneral(editingZoneGeneralValue);
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
                setEditingZoneGeneralValue(copyOfSingleGeneral);
              }
              setOnContentEditing((prev) => !prev);
            }}
          >
            {onContentEditing ? `取消` : `修正`}
          </button>
          <button onClick={() => setDeleteContent(index)}>刪除</button>
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

export default SingleParagraph;
