import React, { useRef, useState, useEffect } from "react";
import checkedImg from "../assets/checked.png";
import errorImg from "../assets/error.png";
import switchImg from "../assets/switch.png";
import aboriginalImg from "../assets/aboriginal.png";

const SingleParagraphV2 = ({
  index,
  isOK,
  general,
  content,
  abstractEn,
  modifiedParagraph,
  figureKeys,
  wrongFigureKeys,
  correctKeys,
  wrongWordKeys,
  aboriginalWordKeys,
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
  const [myReduceFigureKeys, setMyReduceFigureKeys] = useState({});
  const [myReduceWrongFigureKeys, setMyReduceWrongFigureKeys] = useState({});
  const [myReduceCorrectKeys, setMyReduceCorrectKeys] = useState({});
  const [myReduceWrongWordKeys, setMyReduceWrongWordKeys] = useState({});
  const [myReduceAboriginalWordKeys, setMyReduceAboriginalWordKeys] = useState(
    {}
  );

  const [showControlBtns, setShowControlBtns] = useState(() => {
    const obj = {};

    obj[`paragraph-${index}-figure-btn`] = true;
    obj[`paragraph-${index}-wrong-figure-btn`] = true;
    obj[`paragraph-${index}-word-errors-btn`] = true;
    obj[`paragraph-${index}-corrects-btn`] = true;
    obj[`paragraph-${index}-aboriginals-btn`] = true;

    return obj;
  });

  const toggleBtnColor = (key) => {
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

  const toggleWrongWordBtnColor = (key) => {
    divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
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
      divRef.current.querySelectorAll(`.e-${key}`).forEach((el) => {
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

  const buildList = (modifiedParagraphWithSearchStr) => {
    // Test
    // if (general === "0005") {
    //   console.log("rebuild list");
    //   console.log(globalHighlightElement);
    // }

    divRef.current.querySelector(".content").innerHTML = `【${
      !general.includes("技術") ? general : general.match(/[0-9]+/)[0]
    }】 ${modifiedParagraphWithSearchStr || modifiedParagraph}${
      abstractEn ? "<br/><br/>" + abstractEn : ""
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
    setMyReduceWrongWordKeys(reduceWrongWordKeys);
    setMyReduceAboriginalWordKeys(reduceAboriginalWordKeys);
    setMyReduceFigureKeys(reduceFigureKeys);
    setMyReduceWrongFigureKeys(reduceWrongFigureKeys);

    Object.keys(reduceCorrectKeys).forEach((key) => {
      divRef.current.querySelectorAll(`.c-${key}`).forEach((el) => {
        el.style.background = reduceCorrectKeys[key].clicked
          ? elementColorMap[key].color
          : "inherit";
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
    globalHighlightElement
  ]);

  return (
    <div className="paragraph-container not-claim" ref={divRef}>
      <h2 onClick={() => setIsCollapse(general)}>
        {Object.keys(myReduceWrongWordKeys).length === 0 &&
          Object.keys(myReduceWrongFigureKeys).length === 0 && (
            <img src={checkedImg} alt="" />
          )}
        {(Object.keys(myReduceWrongWordKeys).length > 0 ||
          Object.keys(myReduceWrongFigureKeys).length > 0) && (
          <img src={errorImg} alt="" />
        )}
        {Object.keys(myReduceAboriginalWordKeys).length > 0 && (
          <img src={aboriginalImg} alt="" />
        )}
        {general}
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
              id={`paragraph-${index}-figure-btn`}
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
        <p className="content">Sorry! 無法分析本段落!!!</p>

        <div className="paragraph-container-btns">
          <button
            style={{ position: "unset" }}
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

export default SingleParagraphV2;
