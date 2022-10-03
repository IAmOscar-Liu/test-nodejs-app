import React, { useContext, useEffect, useState } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import deleteIcon from "../assets/delete_icon.png";
import editIcon from "../assets/img_386644.png";
import { isKeyValid } from "../dict/keyRegs";

/*
    failedDescriptionOfElementMap: [],
    failedFigureOfDrawingsMap: [],
*/

const FailedElements = ({ handleReInit }) => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const {
    isProcessing,
    descriptionOfElementMap,
    figureOfDrawingsMap,
    failedDescriptionOfElementMap,
    failedFigureOfDrawingsMap
  } = essentialData;
  const [isDescriptionCollapse, setIsDescriptionCollapse] = useState(false);
  const [isDrawingCollapse, setIsDrawingCollapse] = useState(false);
  const [copyFailedDescription, setCopyFailedDescription] = useState([]);
  const [copyFailedFigure, setCopyFailedFigure] = useState([]);
  const [descriptionEditList, setDescriptionEditList] = useState([]);
  const [figureEditList, setFigureEditList] = useState([]);

  const handleDeleteFailedElement = (type, num) => {
    if (type === "description") {
      setCopyFailedDescription((prev) => prev.filter((el) => el.num !== num));
    } else {
      setCopyFailedFigure((prev) => prev.filter((el) => el.num !== num));
    }
  };

  const parseNewElement = (_el) => {
    const el = _el.trim();
    if (el.split(" ").length !== 2) {
      return {
        symbol: "無法分析",
        value: "無法分析"
      };
    } else {
      if (isKeyValid(el.split(" ")[0].trim())) {
        return {
          symbol: el.split(" ")[0],
          value: el.split(" ")[1]
        };
      } else if (isKeyValid(el.split(" ")[1].trim())) {
        return {
          symbol: el.split(" ")[1],
          value: el.split(" ")[0]
        };
      }
      return {
        symbol: "無法分析",
        value: "無法分析"
      };
    }
  };

  useEffect(() => {
    if (
      !isProcessing &&
      failedDescriptionOfElementMap.length > 0 &&
      JSON.stringify(failedDescriptionOfElementMap) !==
        JSON.stringify(copyFailedDescription)
    ) {
      setCopyFailedDescription(failedDescriptionOfElementMap.slice());
      setDescriptionEditList(
        failedDescriptionOfElementMap.map((e) => ({
          isEditing: false,
          value: e.el
        }))
      );
    }
    if (
      !isProcessing &&
      failedFigureOfDrawingsMap.length > 0 &&
      JSON.stringify(failedFigureOfDrawingsMap) !==
        JSON.stringify(copyFailedFigure)
    ) {
      setCopyFailedFigure(failedFigureOfDrawingsMap.slice());
      setFigureEditList(
        failedFigureOfDrawingsMap.map((e) => ({
          isEditing: false,
          value: e.el
        }))
      );
    }
  }, [isProcessing, failedDescriptionOfElementMap, failedFigureOfDrawingsMap]);

  return (
    <>
      {!isProcessing && failedDescriptionOfElementMap.length > 0 && (
        <section className="fail">
          <h2 onClick={() => setIsDescriptionCollapse((prev) => !prev)}>
            無法判別的符號說明
            {isDescriptionCollapse ? <span>✛</span> : <span>⤬</span>}
          </h2>
          <div
            className={`failed-description-content ${
              isDescriptionCollapse ? "collapse" : ""
            }`}
          >
            <>
              {copyFailedDescription.length > 0 && (
                <ul>
                  {copyFailedDescription.map(({ num, el }, idx) => (
                    <li
                      key={idx}
                      style={{
                        backgroundColor:
                          failedDescriptionOfElementMap[idx].el !== el
                            ? "hotpink"
                            : "red"
                      }}
                    >
                      <span
                        style={{
                          paddingLeft: 12,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {" "}
                        {num >= 0 ? `第${num + 1}行:` : "未知行數:"}
                        {failedDescriptionOfElementMap[idx].el !== el &&
                          "\n(已修正)"}
                      </span>
                      <span
                        style={{
                          padding: "0 3px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {" "}
                        {el}
                      </span>
                      <span
                        style={{
                          paddingRight: 9,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <img
                          style={{
                            marginRight: 2,
                            width: 16,
                            height: 20,
                            cursor: "pointer"
                          }}
                          src={editIcon}
                          alt="edit"
                          onClick={() =>
                            setDescriptionEditList((prev) =>
                              prev.map((p, _ii) => {
                                if (_ii === idx) {
                                  return { ...p, isEditing: !p.isEditing };
                                }
                                return p;
                              })
                            )
                          }
                        />
                        <img
                          style={{ width: 19, height: 20, cursor: "pointer" }}
                          src={deleteIcon}
                          alt="delete"
                          onClick={() =>
                            handleDeleteFailedElement("description", num)
                          }
                        />
                      </span>
                      {descriptionEditList[idx] &&
                        descriptionEditList[idx].isEditing && (
                          <>
                            <div>
                              <p>請以「空白格」將符號與元件分開</p>
                              <div>
                                <input
                                  type="text"
                                  value={descriptionEditList[idx].value}
                                  onChange={(e) =>
                                    setDescriptionEditList((prev) =>
                                      prev.map((p, _ii) => {
                                        if (idx === _ii) {
                                          return {
                                            ...p,
                                            value: e.target.value
                                          };
                                        }
                                        return p;
                                      })
                                    )
                                  }
                                />
                                <br />
                                <span>
                                  新符號:{" "}
                                  {
                                    parseNewElement(
                                      descriptionEditList[idx].value.trim()
                                    ).symbol
                                  }
                                </span>
                                <br />
                                <span>
                                  新元件:{" "}
                                  {
                                    parseNewElement(
                                      descriptionEditList[idx].value.trim()
                                    ).value
                                  }
                                </span>
                                <br />
                                <button
                                  onClick={() => {
                                    setCopyFailedDescription((prev) =>
                                      prev.map((p, _ii) => {
                                        if (idx === _ii) {
                                          return {
                                            ...p,
                                            el: descriptionEditList[idx].value
                                          };
                                        }
                                        return p;
                                      })
                                    );
                                    setDescriptionEditList((prev) =>
                                      prev.map((p, _ii) => {
                                        if (idx === _ii) {
                                          return { ...p, isEditing: false };
                                        }
                                        return p;
                                      })
                                    );
                                  }}
                                >
                                  確認
                                </button>
                                <button
                                  style={{ marginLeft: 10 }}
                                  onClick={() => {
                                    setDescriptionEditList((prev) =>
                                      prev.map((p, _ii) => {
                                        if (idx === _ii) {
                                          return {
                                            value:
                                              descriptionEditList[idx].value,
                                            isEditing: false
                                          };
                                        }
                                        return p;
                                      })
                                    );
                                  }}
                                >
                                  取消
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                    </li>
                  ))}
                </ul>
              )}
              {JSON.stringify(copyFailedDescription) !==
                JSON.stringify(failedDescriptionOfElementMap) && (
                <div>
                  <button
                    onClick={async () => {
                      await handleReInit(essentialData, setEssentialData, {
                        method: "description-of-element",
                        data: Object.keys(descriptionOfElementMap)
                          .map((cur, _iii) => {
                            const curEl = descriptionOfElementMap[cur];
                            const _value = curEl.values[0];
                            let _key = cur;
                            if (_key.indexOf("_duplicate") >= 1) {
                              _key = _key.slice(0, _key.indexOf("_duplicate"));
                            }
                            return {
                              num: _iii,
                              el: `${_key} ${_value}`
                            };
                          })
                          .concat(copyFailedDescription)
                      });
                      setCopyFailedDescription([]);
                      setDescriptionEditList([]);
                    }}
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => {
                      setCopyFailedDescription(
                        failedDescriptionOfElementMap.slice()
                      );
                      setDescriptionEditList(
                        failedFigureOfDrawingsMap.map((e) => ({
                          isEditing: false,
                          value: e.el
                        }))
                      );
                    }}
                  >
                    還原
                  </button>
                </div>
              )}
            </>
          </div>
        </section>
      )}
      {!isProcessing && failedFigureOfDrawingsMap.length > 0 && (
        <section>
          <h2 onClick={() => setIsDrawingCollapse((prev) => !prev)}>
            無法判別的
            <br />
            代表圖之符號簡單說明
            {isDrawingCollapse ? <span>✛</span> : <span>⤬</span>}
          </h2>
          <div
            className={`failed-figure-content ${
              isDrawingCollapse ? "collapse" : ""
            }`}
          >
            <>
              {copyFailedFigure.length > 0 && (
                <ul>
                  {copyFailedFigure.map(({ num, el }, idx) => (
                    <li
                      key={idx}
                      style={{
                        backgroundColor:
                          failedFigureOfDrawingsMap[idx].el !== el
                            ? "hotpink"
                            : "red"
                      }}
                    >
                      <span
                        style={{
                          paddingLeft: 12,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {" "}
                        {num >= 0 ? `第${num + 1}行:` : "未知行數:"}
                        {failedFigureOfDrawingsMap[idx].el !== el &&
                          "\n(已修正)"}
                      </span>
                      <span
                        style={{
                          padding: "0 3px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {el}
                      </span>
                      <span
                        style={{
                          paddingRight: 9,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <img
                          style={{
                            marginRight: 2,
                            width: 16,
                            height: 20,
                            cursor: "pointer"
                          }}
                          src={editIcon}
                          alt="edit"
                          onClick={() =>
                            setFigureEditList((prev) =>
                              prev.map((p, _ii) => {
                                if (_ii === idx) {
                                  return { ...p, isEditing: !p.isEditing };
                                }
                                return p;
                              })
                            )
                          }
                        />
                        <img
                          style={{ width: 19, height: 20, cursor: "pointer" }}
                          src={deleteIcon}
                          alt="delete"
                          onClick={() =>
                            handleDeleteFailedElement("figure", num)
                          }
                        />
                      </span>
                      {figureEditList[idx] && figureEditList[idx].isEditing && (
                        <>
                          <div>
                            <p>請以「空白格」將符號與元件分開</p>
                            <div>
                              <input
                                type="text"
                                value={figureEditList[idx].value}
                                onChange={(e) =>
                                  setFigureEditList((prev) =>
                                    prev.map((p, _ii) => {
                                      if (idx === _ii) {
                                        return {
                                          ...p,
                                          value: e.target.value
                                        };
                                      }
                                      return p;
                                    })
                                  )
                                }
                              />
                              <br />
                              <span>
                                新符號:{" "}
                                {
                                  parseNewElement(
                                    figureEditList[idx].value.trim()
                                  ).symbol
                                }
                              </span>
                              <br />
                              <span>
                                新元件:{" "}
                                {
                                  parseNewElement(
                                    figureEditList[idx].value.trim()
                                  ).value
                                }
                              </span>
                              <br />
                              <button
                                onClick={() => {
                                  setCopyFailedFigure((prev) =>
                                    prev.map((p, _ii) => {
                                      if (idx === _ii) {
                                        return {
                                          ...p,
                                          el: figureEditList[idx].value
                                        };
                                      }
                                      return p;
                                    })
                                  );
                                  setFigureEditList((prev) =>
                                    prev.map((p, _ii) => {
                                      if (idx === _ii) {
                                        return { ...p, isEditing: false };
                                      }
                                      return p;
                                    })
                                  );
                                }}
                              >
                                確認
                              </button>
                              <button
                                style={{ marginLeft: 10 }}
                                onClick={() => {
                                  setFigureEditList((prev) =>
                                    prev.map((p, _ii) => {
                                      if (idx === _ii) {
                                        return {
                                          value: figureEditList[idx].value,
                                          isEditing: false
                                        };
                                      }
                                      return p;
                                    })
                                  );
                                }}
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {JSON.stringify(copyFailedFigure) !==
                JSON.stringify(failedFigureOfDrawingsMap) && (
                <div>
                  <button
                    onClick={async () => {
                      // Test
                      // console.log(
                      //   Object.keys(figureOfDrawingsMap)
                      //     .map((cur, _iii) => {
                      //       const curEl = figureOfDrawingsMap[cur];
                      //       const _value = curEl.values[0];
                      //       let _key = cur;
                      //       if (_key.indexOf("_duplicate") >= 1) {
                      //         _key = _key.slice(0, _key.indexOf("_duplicate"));
                      //       }
                      //       return {
                      //         num: _iii,
                      //         el: `${_key} ${_value}`
                      //       };
                      //     })
                      //     .concat(copyFailedFigure)
                      // );
                      // debugger;
                      // Test
                      await handleReInit(essentialData, setEssentialData, {
                        method: "figure-drawings",
                        data: Object.keys(figureOfDrawingsMap)
                          .map((cur, _iii) => {
                            const curEl = figureOfDrawingsMap[cur];
                            const _value = curEl.values[0];
                            let _key = cur;
                            if (_key.indexOf("_duplicate") >= 1) {
                              _key = _key.slice(0, _key.indexOf("_duplicate"));
                            }
                            return {
                              num: _iii,
                              el: `${_key} ${_value}`
                            };
                          })
                          .concat(copyFailedFigure)
                      });
                      setCopyFailedFigure([]);
                      setFigureEditList([]);
                    }}
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => {
                      setCopyFailedFigure(failedFigureOfDrawingsMap.slice());
                      setFigureEditList(
                        failedFigureOfDrawingsMap.map((e) => ({
                          isEditing: false,
                          value: e.el
                        }))
                      );
                    }}
                  >
                    還原
                  </button>
                </div>
              )}
            </>
          </div>
        </section>
      )}
    </>
  );
};

export default FailedElements;
