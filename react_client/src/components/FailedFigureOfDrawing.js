import React, { useContext, useEffect, useState } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import deleteIcon from "../assets/delete_icon.png";
import editIcon from "../assets/img_386644.png";

const FailedFigureOfDrawing = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const { isProcessing, failedFigureOfDrawingsMap } = essentialData;
  const [isDrawingCollapse, setIsDrawingCollapse] = useState(false);
  const [copyFailedFigure, setCopyFailedFigure] = useState([]);
  const [figureEditList, setFigureEditList] = useState([]);

  const handleDeleteFailedElement = (type, num) => {
    setCopyFailedFigure((prev) => prev.filter((el) => el.num !== num));
  };

  const handleFailElementChange = (e, idx) => {
    setFigureEditList((prev) =>
      prev.map((p, _ii) => {
        if (idx === _ii) {
          return { ...p, value: e.target.value };
        }
        return p;
      })
    );
  };

  useEffect(() => {
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
  }, [isProcessing, failedFigureOfDrawingsMap]);

  return (
    <>
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
                  {[...copyFailedFigure].map(({ num, el }, idx) => (
                    <li key={idx}>
                      <span
                        style={{
                          paddingLeft: 12,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {" "}
                        {num >= 0 ? `第${num + 1}行:` : "未知行數:"}
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
                                  handleFailElementChange(e, idx)
                                }
                              />
                              <br />
                              <span>新符號:</span>
                              <br />
                              <span>新元件:</span>
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
                    onClick={() =>
                      setEssentialData((prev) => ({
                        ...prev,
                        failedFigureOfDrawingsMap: copyFailedFigure
                      }))
                    }
                  >
                    儲存
                  </button>
                  <button
                    onClick={() =>
                      setCopyFailedFigure(failedFigureOfDrawingsMap.slice())
                    }
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

export default FailedFigureOfDrawing;
