import React, { useContext, useState, useEffect } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import editIcon from "../assets/img_386644.png";
import deleteIcon from "../assets/delete_icon.png";
import { isKeyValid } from "../dict/keyRegs";
import { handleMultipleValues } from "../utils/otherUtils";

const FigureOfDrawings = ({ handleReInit }) => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const [isCollapse, setIsCollapse] = useState(false);
  const [copyOfFigure, setCopyOfFigure] = useState({});
  const [onEditingLists, setOnEdigintLists] = useState([]);
  const [onAddingElement, setOnAddingElement] = useState(false);
  const [addElementValue, setAddElementValue] = useState({
    symbol: "",
    elName: ""
  });

  const checkIfKeyDuplicate = () => {
    const keyArr = Object.keys(copyOfFigure).map(
      (mkey) => copyOfFigure[mkey].newKey || copyOfFigure[mkey].key
    );
    return (
      keyArr.filter((item, index) => keyArr.indexOf(item) !== index).length > 0
    );
  };

  const parseStatus = (status) => {
    if (status === "Ok" || status === "new Added") {
      return status;
    } else if (status === "element inconsistent") {
      return "與符號說明元件名稱不一致";
    } else if (status === "key duplicate") {
      return "符號重複";
    } else if (status === "Not in description of element") {
      return "元件不在符號說明中";
    } else {
      return status;
    }
  };

  const shouldRenderSaveBtn = () => {
    if (Object.keys(copyOfFigure).length === 0 || onEditingLists.length === 0) {
      return false;
    }
    try {
      if (
        Object.keys(copyOfFigure).length ===
          Object.keys(essentialData.figureOfDrawingsMap).length &&
        Object.keys(copyOfFigure)
          .map((mkey) => copyOfFigure[mkey])
          .filter((el) => el.status === "new Added").length === 0 &&
        Object.keys(copyOfFigure)
          .map((mkey) => copyOfFigure[mkey].newKey)
          .every((nk) => nk === null) &&
        Object.keys(copyOfFigure)
          .map((mkey) => copyOfFigure[mkey].newValues)
          .every((nv) => nv === null)
      ) {
        return false;
      } else {
        return true;
      }
    } catch (error) {
      console.log(`error: ${error.message}`);
      return false;
    }
  };

  const handleAddElement = (symbol, elName) => {
    if (!isKeyValid(symbol.trim())) {
      window.alert(`符號${symbol}不符合格式。`);
      return;
    }
    if (
      Object.keys(copyOfFigure)
        .map((k) => copyOfFigure[k].newKey || copyOfFigure[k].key)
        .includes(symbol)
    ) {
      window.alert(`符號${symbol}已經使用過了。`);
      return;
    }
    setOnEdigintLists((prev) => [...prev, false]);
    setCopyOfFigure((prev) => ({
      ...prev,
      [symbol]: {
        values: handleMultipleValues(elName),
        // elName.split(/[/,()（）]/).length === 1
        //   ? [elName]
        //   : [elName, ...elName.split(/[/,()（）]/).map((v) => v.trim())],
        status: "new Added",
        num: Object.keys(prev).length + 100000,
        key: symbol,
        newKey: null,
        newValues: null
      }
    }));
    setOnAddingElement(false);
    setAddElementValue({ symbol: "", elName: "" });
  };

  const initCopyOfFigure = () =>
    Object.keys(essentialData.figureOfDrawingsMap).reduce(
      (acc, cur, num) => ({
        ...acc,
        [cur]: {
          ...essentialData.figureOfDrawingsMap[cur],
          num,
          key: cur,
          newKey: null,
          newValues: null
        }
      }),
      {}
    );

  const initOnEditingLists = () =>
    Object.keys(essentialData.figureOfDrawingsMap).map((_) => false);

  // globalHighlightElement
  const setGlobalHighlightElement = (id) => {
    // console.log(id);
    const prevGlobalHighlightElement = [
      ...essentialData.globalHighlightElement
    ];

    if (prevGlobalHighlightElement.find((el) => el === id)) {
      setEssentialData((prev) => ({
        ...prev,
        globalHighlightOn: !prevGlobalHighlightElement.length !== 1,
        globalHighlightElement: prevGlobalHighlightElement.filter(
          (g) => g !== id
        )
      }));
    } else {
      setEssentialData((prev) => ({
        ...prev,
        globalHighlightOn: true,
        globalHighlightElement: [...prevGlobalHighlightElement, id]
      }));
    }
  };

  useEffect(() => {
    if (
      !essentialData.isProcessing &&
      Object.keys(essentialData.figureOfDrawingsMap).length > 0 &&
      !(
        Object.keys(essentialData.figureOfDrawingsMap).length === 1 &&
        essentialData.figureOfDrawingsMap.parse_failed
      ) &&
      JSON.stringify(copyOfFigure) !==
        JSON.stringify(essentialData.figureOfDrawingsMap)
    ) {
      setCopyOfFigure(initCopyOfFigure());
      setOnEdigintLists(initOnEditingLists());
    }
  }, [essentialData]);

  return (
    <section>
      <h2 onClick={() => setIsCollapse((prev) => !prev)}>
        代表圖之符號簡單說明{isCollapse ? <span>✛</span> : <span>⤬</span>}
      </h2>
      <div className={`figure-content ${isCollapse ? "collapse" : ""}`}>
        {essentialData.isProcessing ? (
          <h3>Processing...</h3>
        ) : Object.keys(essentialData.figureOfDrawingsMap).length === 0 ? (
          <h3>No Data passed in yet.</h3>
        ) : Object.keys(essentialData.figureOfDrawingsMap).length === 1 &&
          essentialData.figureOfDrawingsMap.parse_failed ? (
          <h2>無法分析代表圖之符號說明的內容</h2>
        ) : (
          Object.keys(copyOfFigure).length > 0 &&
          onEditingLists.length > 0 && (
            <>
              <ul>
                <li>
                  <span>符號</span>
                  <span>元件名稱</span>
                  <span>
                    <img
                      src={editIcon}
                      style={{ visibility: "hidden" }}
                      alt=""
                    />
                    <img
                      src={deleteIcon}
                      alt=""
                      style={{ visibility: "hidden" }}
                    />
                  </span>
                  <span>狀態</span>
                </li>
                {Object.keys(copyOfFigure)
                  .map((key) => copyOfFigure[key])
                  .sort((a, b) => a.num - b.num)
                  .map(
                    ({ key, id, status, newKey, values, newValues }, index) => {
                      const statusInfo = parseStatus(status);
                      const liColorId = id;
                      const liColor =
                        (essentialData.elementColorMap[liColorId] &&
                          essentialData.elementColorMap[liColorId].color) ||
                        "hotpink";
                      const liStyle =
                        (newKey !== null || newValues !== null) &&
                        statusInfo !== "new Added"
                          ? { backgroundColor: "hotpink" }
                          : statusInfo === "Ok" || statusInfo === "new Added"
                          ? {
                              backgroundColor: !essentialData.globalHighlightOn
                                ? "transparent"
                                : essentialData.globalHighlightElement
                                    .length === 0 ||
                                  essentialData.globalHighlightElement.find(
                                    (el) => el === id
                                  )
                                ? liColor
                                : "transparent"
                            }
                          : status === "element inconsistent" ||
                            status === "Not in description of element"
                          ? {
                              backgroundColor: !essentialData.globalHighlightOn
                                ? "transparent"
                                : essentialData.globalHighlightElement
                                    .length === 0 ||
                                  essentialData.globalHighlightElement.find(
                                    (el) => el === id
                                  )
                                ? liColor
                                : "transparent",
                              border: "3px rgb(255,0,0) solid",
                              color: "rgb(255,0,0)",
                              fontWeight: "bold",
                              boxShadow: "none",
                              textShadow: "2px 2px 1px black"
                            }
                          : {
                              backgroundColor: "rgb(255,0,0)",
                              fontWeight: 700,
                              border: "2px #111 solid"
                            };
                      return (
                        <li key={key} style={liStyle}>
                          {onEditingLists[index] ? (
                            <span>
                              <input
                                type="text"
                                value={newKey || key}
                                onChange={(e) =>
                                  setCopyOfFigure((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      newKey:
                                        e.target.value === key
                                          ? null
                                          : e.target.value
                                    }
                                  }))
                                }
                              />
                            </span>
                          ) : (
                            <span onClick={() => setGlobalHighlightElement(id)}>
                              {newKey ||
                                (/duplicate/.test(key)
                                  ? key.replace(/_duplicate_[0-9]*/, "")
                                  : key)}
                            </span>
                          )}
                          {onEditingLists[index] ? (
                            <span>
                              <input
                                type="text"
                                value={(newValues || values)[0]}
                                onChange={(e) =>
                                  setCopyOfFigure((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      newValues:
                                        values[0] === e.target.value
                                          ? null
                                          : handleMultipleValues(
                                              e.target.value
                                            ) /* e.target.value.split(/[/,()（）]/)
                                              .length === 1
                                          ? [e.target.value]
                                          : [
                                              e.target.value,
                                              ...e.target.value
                                                .split(/[/,()（）]/)
                                                .map((v) => v.trim())
                                            ] */
                                    }
                                  }))
                                }
                              />
                            </span>
                          ) : (
                            <span onClick={() => setGlobalHighlightElement(id)}>
                              {(newValues || values)[0]}
                            </span>
                          )}
                          <span>
                            <img
                              src={editIcon}
                              alt="edit"
                              onClick={() => {
                                if (
                                  onEditingLists[index] &&
                                  copyOfFigure[key].newKey &&
                                  /[^θ,、'-~a-z0-9\s]/i.test(
                                    copyOfFigure[key].newKey
                                  )
                                ) {
                                  window.alert(
                                    `符號${copyOfFigure[key].newKey}不符合格式。`
                                  );
                                  return;
                                }
                                if (
                                  onEditingLists[index] &&
                                  copyOfFigure[key].newKey &&
                                  checkIfKeyDuplicate()
                                ) {
                                  window.alert(
                                    `該符號${copyOfFigure[key].newKey}已經使用過了。`
                                  );
                                  return;
                                }
                                setOnEdigintLists((prev) =>
                                  prev.map((p, prevIdx) =>
                                    prevIdx === index ? !p : p
                                  )
                                );
                              }}
                            />
                            <img
                              src={deleteIcon}
                              alt="delete"
                              onClick={() => {
                                setOnEdigintLists((prev) =>
                                  prev.filter((_, li) => index !== li)
                                );
                                setCopyOfFigure((prev) =>
                                  Object.keys(prev).reduce((acc, cur) => {
                                    if (cur !== key) {
                                      acc[cur] = prev[cur];
                                    }
                                    return acc;
                                  }, {})
                                );
                              }}
                            />
                          </span>
                          <span>
                            {(newKey !== null || newValues !== null) &&
                            statusInfo !== "new Added"
                              ? "已修正"
                              : status === "new Added"
                              ? "新增元件"
                              : statusInfo.toUpperCase()}
                          </span>
                        </li>
                      );
                    }
                  )}
              </ul>
              {onAddingElement && (
                <p>
                  <label htmlFor="add-symbol">符號: </label>
                  <input
                    type="text"
                    id="add-symbol"
                    style={{ width: 100, height: 22 }}
                    value={addElementValue.symbol}
                    onChange={(e) =>
                      setAddElementValue((prev) => ({
                        ...prev,
                        symbol: e.target.value
                      }))
                    }
                  />
                  <br />
                  <label htmlFor="add-element">元件名稱: </label>
                  <input
                    type="text"
                    id="add-element"
                    style={{ marginRight: ".2em", height: 22, minWidth: 190 }}
                    value={addElementValue.elName}
                    onChange={(e) =>
                      setAddElementValue((prev) => ({
                        ...prev,
                        elName: e.target.value
                      }))
                    }
                  />
                  <button
                    disabled={
                      !(
                        addElementValue.symbol !== "" &&
                        addElementValue.elName !== ""
                      )
                    }
                    style={{ fontSize: "1.06em", transform: "translateY(2px)" }}
                    onClick={() =>
                      handleAddElement(
                        addElementValue.symbol.trim(),
                        addElementValue.elName.trim()
                      )
                    }
                  >
                    確認
                  </button>
                </p>
              )}
              <div>
                {(!essentialData.globalHighlightOn ||
                  essentialData.globalHighlightElement.length > 0) && (
                  <button
                    className="toggle-color"
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
                {essentialData.globalHighlightOn &&
                  essentialData.globalHighlightElement.length === 0 && (
                    <button
                      className="toggle-color"
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
                <button onClick={() => setOnAddingElement((prev) => !prev)}>
                  {onAddingElement ? "取消" : "新增"}
                </button>
                {shouldRenderSaveBtn() && (
                  <>
                    <button
                      onClick={async() => {
                        if (checkIfKeyDuplicate()) {
                          window.alert(`有符號重複，請檢查後再按儲存。`);
                          return;
                        }
                        await handleReInit(essentialData, setEssentialData, {
                          method: "figure-drawings",
                          data: Object.keys(copyOfFigure)
                            .map((cur) => {
                              const curEl = copyOfFigure[cur];
                              const _value = (curEl.newValues ||
                                curEl.values)[0];
                              let _key = curEl.newKey || curEl.key;
                              if (_key.indexOf("_duplicate") >= 1) {
                                _key = _key.slice(
                                  0,
                                  _key.indexOf("_duplicate")
                                );
                              }
                              return {
                                num:
                                  curEl.num >= 100000
                                    ? curEl.num - 100000
                                    : curEl.num,
                                el: `${_key} ${_value}`
                              };
                            })
                            .concat(essentialData.failedFigureOfDrawingsMap)
                        });
                        setOnAddingElement(false);
                        setAddElementValue({ symbol: "", elName: "" });
                      }}
                    >
                      儲存
                    </button>
                    <button
                      onClick={() => {
                        setOnAddingElement(false);
                        setAddElementValue({ symbol: "", elName: "" });
                        setOnEdigintLists(initOnEditingLists());
                        setCopyOfFigure(initCopyOfFigure());
                      }}
                    >
                      還原
                    </button>
                  </>
                )}
              </div>
            </>
          )
        )}
      </div>
    </section>
  );
};

export default FigureOfDrawings;
