import React, { useContext, useEffect, useState } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import editIcon from "../assets/img_386644.png";
import deleteIcon from "../assets/delete_icon.png";
import { isKeyValid } from "../dict/keyRegs";
import { handleMultipleValues } from "../utils/otherUtils";

const DescriptionOfElement = ({ handleReInit }) => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const [isCollapse, setIsCollapse] = useState(false);
  const [copyOfDescription, setCopyOfDescription] = useState({});
  const [onEditingLists, setOnEdigintLists] = useState([]);
  const [onAddingElement, setOnAddingElement] = useState(false);
  const [addElementValue, setAddElementValue] = useState({
    symbol: "",
    elName: ""
  });

  const checkIfKeyDuplicate = () => {
    const keyArr = Object.keys(copyOfDescription).map(
      (mkey) => copyOfDescription[mkey].newKey || copyOfDescription[mkey].key
    );
    return (
      keyArr.filter((item, index) => keyArr.indexOf(item) !== index).length > 0
    );
  };

  const shouldRenderSaveBtn = () => {
    if (
      Object.keys(copyOfDescription).length === 0 ||
      onEditingLists.length === 0
    ) {
      return false;
    }
    try {
      if (
        Object.keys(copyOfDescription).length ===
          Object.keys(essentialData.descriptionOfElementMap).length &&
        Object.keys(copyOfDescription)
          .map((mkey) => copyOfDescription[mkey])
          .filter((el) => el.status === "new Added").length === 0 &&
        Object.keys(copyOfDescription)
          .map((mkey) => copyOfDescription[mkey].newKey)
          .every((nk) => nk === null) &&
        Object.keys(copyOfDescription)
          .map((mkey) => copyOfDescription[mkey].newValues)
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
    if (!isKeyValid(symbol)) {
      window.alert(`符號${symbol.trim()}不符合格式。`);
      return;
    }
    if (
      Object.keys(copyOfDescription)
        .map((k) => copyOfDescription[k].newKey || copyOfDescription[k].key)
        .includes(symbol)
    ) {
      window.alert(`符號${symbol}已經使用過了。`);
      return;
    }
    setOnEdigintLists((prev) => [...prev, false]);
    setCopyOfDescription((prev) => ({
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

  const initCopyOfDescription = () =>
    Object.keys(essentialData.descriptionOfElementMap).reduce(
      (acc, cur, num) => ({
        ...acc,
        [cur]: {
          ...essentialData.descriptionOfElementMap[cur],
          num,
          key: cur,
          newKey: null,
          newValues: null
        }
      }),
      {}
    );

  const initOnEditingLists = () =>
    Object.keys(essentialData.descriptionOfElementMap).map((_) => false);

  // globalHighlightElement
  const setGlobalHighlightElement = (id) => {
    // console.log(id);
    const prevGlobalHighlightElement = [
      ...essentialData.globalHighlightElement
    ];

    if (prevGlobalHighlightElement.find((el) => el === id)) {
      setEssentialData((prev) => ({
        ...prev,
        globalHighlightOn: prevGlobalHighlightElement.length !== 1,
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
      Object.keys(essentialData.descriptionOfElementMap).length > 0 &&
      !(
        Object.keys(essentialData.descriptionOfElementMap).length === 1 &&
        essentialData.descriptionOfElementMap.parse_failed
      ) &&
      JSON.stringify(copyOfDescription) !==
        JSON.stringify(essentialData.descriptionOfElementMap)
    ) {
      setCopyOfDescription(initCopyOfDescription());
      setOnEdigintLists(initOnEditingLists());
    }
  }, [essentialData]);

  return (
    <section>
      <h2 onClick={() => setIsCollapse((prev) => !prev)}>
        符號說明{isCollapse ? <span>✛</span> : <span>⤬</span>}
      </h2>
      <div className={`description-content ${isCollapse ? "collapse" : ""}`}>
        {essentialData.isProcessing ? (
          <h3>Processing...</h3>
        ) : Object.keys(essentialData.descriptionOfElementMap).length === 0 ? (
          <h3>No Data passed in yet.</h3>
        ) : Object.keys(essentialData.descriptionOfElementMap).length === 1 &&
          essentialData.descriptionOfElementMap.parse_failed ? (
          <h2>無法分析符號說明的內容</h2>
        ) : (
          Object.keys(copyOfDescription).length > 0 &&
          onEditingLists.length > 0 && (
            <>
              <ul>
                <li>
                  <span>符號</span>
                  <span>元件名稱</span>
                  <span>
                    <img
                      src={editIcon}
                      alt=""
                      style={{ visibility: "hidden" }}
                    />
                    <img
                      src={deleteIcon}
                      alt=""
                      style={{ visibility: "hidden" }}
                    />
                  </span>
                  <span>狀態</span>
                </li>
                {Object.keys(copyOfDescription)
                  .map((key) => copyOfDescription[key])
                  .sort((a, b) => a.num - b.num)
                  .map(
                    (
                      { key, id, status, newKey, values, newValues, isUsed },
                      index
                    ) => {
                      const liColorId = id;
                      const liColor =
                        (essentialData.elementColorMap[liColorId] &&
                          essentialData.elementColorMap[liColorId].color) ||
                        "hotpink";
                      const liStyle =
                        (newKey !== null || newValues !== null) &&
                        status !== "new Added"
                          ? { backgroundColor: "hotpink" }
                          : status === "key duplicate"
                          ? {
                              backgroundColor: "rgb(255,0,0)",
                              fontWeight: 700,
                              border: "2px #111 solid"
                            }
                          : status === "element inconsistent"
                          ? {
                              backgroundColor: liColor,
                              border: "3px rgb(255,0,0) solid",
                              color: "rgb(255,0,0)",
                              fontWeight: "bold",
                              boxShadow: "none",
                              textShadow: "2px 2px 1px black"
                            }
                          : {
                              // backgroundColor: liColor
                              backgroundColor: !essentialData.globalHighlightOn
                                ? "transparent"
                                : essentialData.globalHighlightElement
                                    .length === 0 ||
                                  essentialData.globalHighlightElement.find(
                                    (el) => el === id
                                  )
                                ? liColor
                                : "transparent"
                            };
                      return (
                        <li key={key} style={liStyle}>
                          {onEditingLists[index] ? (
                            <span>
                              <input
                                type="text"
                                value={newKey || key}
                                onChange={(e) =>
                                  setCopyOfDescription((prev) => ({
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
                                  setCopyOfDescription((prev) => ({
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
                                  copyOfDescription[key].newKey &&
                                  /[^θ,、'-~a-z0-9\s]/i.test(
                                    copyOfDescription[key].newKey
                                  )
                                ) {
                                  window.alert(
                                    `符號${copyOfDescription[key].newKey}不符合格式。`
                                  );
                                  return;
                                }
                                if (
                                  onEditingLists[index] &&
                                  copyOfDescription[key].newKey &&
                                  checkIfKeyDuplicate()
                                ) {
                                  window.alert(
                                    `該符號${copyOfDescription[key].newKey}已經使用過了。`
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
                                setCopyOfDescription((prev) =>
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
                            status !== "new Added"
                              ? "已修正"
                              : status
                              ? status === "key duplicate"
                                ? "符號重複"
                                : status === "new Added"
                                ? "新增元件"
                                : "與主要代表圖元件名稱不一致"
                              : isUsed
                              ? "已被主要代表圖使用"
                              : "未被主要代表圖使用"}
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
                      onClick={async () => {
                        if (checkIfKeyDuplicate()) {
                          window.alert(`有符號重複，請檢查後再按儲存。`);
                          return;
                        }
                        await handleReInit(essentialData, setEssentialData, {
                          method: "description-of-element",
                          data: Object.keys(copyOfDescription)
                            .map((cur) => {
                              const curEl = copyOfDescription[cur];
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
                            .concat(essentialData.failedDescriptionOfElementMap)
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
                        setCopyOfDescription(initCopyOfDescription());
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

export default DescriptionOfElement;
