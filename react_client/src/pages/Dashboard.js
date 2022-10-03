import React, { useEffect, useContext, useCallback, useState } from "react";
import { EssentialDataContextProvider } from "../contexts/EssentialDataContext";
import { XMLContextProvider } from "../contexts/XMLContext";
import { UpdateParagraphContextProvider } from "../contexts/UpdateParagraphContext";
import { getPathName } from "../utils/getPathName";
import Dropzone from "react-dropzone";
import { fullCharToHalf } from "../utils/fullCharToHalf";

const Dashboard = () => {
  const [essentialData, setEssentialData] = useContext(
    EssentialDataContextProvider
  );
  const [XMLData, setXMLData] = useContext(XMLContextProvider);
  const { savedFileContent, setSavedFileContent } = useContext(
    UpdateParagraphContextProvider
  );
  const [isDragOver, setIsDragOver] = useState(false);
  // const [isInEditingMode, setIsInEditingMode] = useState(false);
  // const [textAreaValue, setTextAreaValue] = useState(() => {
  //   if (savedFileContent !== "") {
  //     return savedFileContent;
  //   }
  //   try {
  //     return XMLData.fileContent ? XMLData.fileContent.toString() : "";
  //   } catch (error) {
  //     return "";
  //   }
  // });
  // setSavedFileContent(() => {
  //   if (savedFileContent !== "") {
  //     return savedFileContent;
  //   }
  //   try {
  //     return XMLData.fileContent ? XMLData.fileContent.toString() : "";
  //   } catch (error) {
  //     return "";
  //   }
  // });

  const dragAreaMsg = essentialData.dragAreaMsg;
  const setDragAreaMsg = (msg) => {
    setEssentialData((prev) => ({ ...prev, dragAreaMsg: msg }));
  };

  const handleFileChange = (fileName, fileContent) => {
    // handle the file...
    const newFileName = Math.random().toString().slice(2, 8) + fileName;

    setXMLData((prev) => ({
      ...prev,
      isLoading: true,
      fileName: newFileName,
      fileContent
    }));
  };

  useEffect(() => {
    setEssentialData((prev) => ({
      ...prev,
      pathName: getPathName()
    }));
  }, []);

  useEffect(() => {
    let newTextAreaValue;
    try {
      newTextAreaValue = XMLData.fileContent
        ? XMLData.fileContent.toString()
        : "";
    } catch (error) {
      newTextAreaValue = "";
    }
    setSavedFileContent((prev) => ({
      ...prev,
      content: newTextAreaValue,
      textAreaValue: newTextAreaValue
    }));
  }, [XMLData.fileContent]);

  const handleOnDrop = useCallback((acceptedFiles) => {
    setIsDragOver(false);

    if (!acceptedFiles) {
      return;
    }
    const file = acceptedFiles[0];
    const fileName = file.name;
    const msg = `無法讀取檔案${fileName}，請確認檔案是否為XML檔並重新選取一次。`;
    try {
      if (!/.xml$/.test(fileName)) {
        const fileNotXmlErrMsg = `檔案${fileName}不是XML檔，請選擇XML檔。`;
        setDragAreaMsg(fileNotXmlErrMsg);
        window.alert(fileNotXmlErrMsg);
        return;
      }

      const reader = new FileReader();

      reader.onabort = () => {
        setDragAreaMsg(msg);
        window.alert(msg);
      };
      reader.onerror = () => {
        setDragAreaMsg(msg);
        window.alert(msg);
      };
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        // convert 0-9 a-z A-Z from full to half
        const convertFullToHalf = fullCharToHalf(binaryStr);
        handleFileChange(file.name, convertFullToHalf);
      };
      reader.readAsText(file, "utf8");
    } catch (error) {
      setDragAreaMsg(msg);
      window.alert(msg);
    }
  }, []);

  return (
    <>
      <section className="title-section">
        <h1>儀表板</h1>
      </section>
      <section className="dashboard-section">
        <div className="dashboard-section-btns">
          <button
            className={savedFileContent.isInEditingMode ? "active" : ""}
            onClick={() =>
              setSavedFileContent((prev) => ({
                ...prev,
                isInEditingMode: true
              }))
            }
          >
            貼上XML資料
          </button>
          <button
            className={savedFileContent.isInEditingMode ? "" : "active"}
            onClick={() =>
              setSavedFileContent((prev) => ({
                ...prev,
                isInEditingMode: false
              }))
            }
          >
            選取XML檔案
          </button>
        </div>
        {savedFileContent.isInEditingMode ? (
          <>
            {XMLData.fileName !== "" &&
              !essentialData.isProcessing &&
              essentialData.missingData.length > 0 &&
              /具備完整的內容後再重新上傳。$/.test(dragAreaMsg) && (
                <div className="edit-zone-error">
                  <p>你的XML內容缺少以下資料:</p>
                  <ul style={{ paddingLeft: "1.8em" }}>
                    {essentialData.missingData.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <p style={{ marginTop: ".3em" }}>
                    請確認你上傳的內容具備完整的內容後再重新上傳。
                  </p>
                </div>
              )}
            {/^該XML檔的格式有誤無法讀取|不是XML檔，請選擇XML檔。$|不是XML檔，請選擇XML檔。$/.test(
              dragAreaMsg
            ) && (
              <div className="edit-zone-error">
                <p>{dragAreaMsg}</p>
              </div>
            )}
            {/已成功上傳，你可以點擊此處再次選擇檔案。$/.test(dragAreaMsg) && (
              <div className="edit-zone-ok">
                <p>{`你的檔案${XMLData.fileName.slice(
                  6
                )}已成功上傳，你可以重新輸入後再按「送出」。`}</p>
              </div>
            )}
            <div className="edit-zone">
              <textarea
                required
                placeholder="請在此處貼上XML資料"
                value={savedFileContent.textAreaValue}
                onChange={(e) =>
                  setSavedFileContent((prev) => ({
                    ...prev,
                    textAreaValue: e.target.value
                  }))
                }
              ></textarea>
            </div>
            <div className="dashboard-section-btns-bottom">
              <button
                disabled={
                  savedFileContent.textAreaValue.length === 0 ||
                  essentialData.isProcessing
                    ? true
                    : ""
                }
                onClick={() => {
                  setSavedFileContent((prev) => ({
                    ...prev,
                    content: prev.textAreaValue
                  }));
                  handleFileChange(
                    "untitle.xml",
                    fullCharToHalf(savedFileContent.textAreaValue)
                  );
                }}
              >
                送出
              </button>
              {savedFileContent.textAreaValue !== savedFileContent.content && (
                <button
                  onClick={() =>
                    setSavedFileContent((prev) => ({
                      ...prev,
                      textAreaValue: prev.content
                    }))
                  }
                >
                  還原
                </button>
              )}
              <button
                onClick={() =>
                  setSavedFileContent((prev) => ({
                    ...prev,
                    textAreaValue: ""
                  }))
                }
              >
                清除
              </button>
            </div>
          </>
        ) : (
          <div className="drag-zone">
            <Dropzone
              onDrop={handleOnDrop}
              onDragEnter={() => setIsDragOver(true)}
              onDragLeave={() => setIsDragOver(false)}
            >
              {({ getRootProps, getInputProps }) => (
                <section
                  className={`drag-zone-section ${
                    isDragOver ? "dragover" : ""
                  }`}
                  style={
                    !isDragOver &&
                    /已成功上傳，你可以點擊此處再次選擇檔案。$/.test(
                      dragAreaMsg
                    )
                      ? { backgroundColor: "lightgreen" }
                      : !isDragOver &&
                        /^該XML檔的格式有誤無法讀取|不是XML檔，請選擇XML檔。$|不是XML檔，請選擇XML檔。$|具備完整的內容後再重新上傳。$/.test(
                          dragAreaMsg
                        )
                      ? { backgroundColor: "rgba(255,0,0,.7)" }
                      : {}
                  }
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <div>
                    {XMLData.fileName !== "" &&
                      !essentialData.isProcessing &&
                      essentialData.missingData.length > 0 &&
                      /具備完整的內容後再重新上傳。$/.test(dragAreaMsg) && (
                        <div style={{ marginBottom: "1em", fontSize: "1.2em" }}>
                          <p style={{ lineHeight: 1.6 }}>
                            你的XML檔缺少以下資料:
                          </p>
                          <ul style={{ paddingLeft: "1.8em" }}>
                            {essentialData.missingData.map((d) => (
                              <li key={d}>{d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    <p>{dragAreaMsg}</p>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
        )}
        {!savedFileContent.isInEditingMode &&
          /已成功上傳，你可以點擊此處再次選擇檔案。$/.test(dragAreaMsg) && (
            <button
              onClick={() =>
                handleFileChange(XMLData.fileName.slice(6), XMLData.fileContent)
              }
            >
              重新上傳
            </button>
          )}
      </section>
    </>
  );
};

export default Dashboard;
