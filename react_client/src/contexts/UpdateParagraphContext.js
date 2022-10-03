import React, { createContext, useState } from "react";

export const UpdateParagraphContextProvider = createContext();

const UpdateParagraphContext = ({ children }) => {
  // 新型內容
  const [
    allUpdateDisclosureParagraph,
    setAllUpdateDisclosureParagraph
  ] = useState([]);

  // 實施方式
  const [
    allUpdateModeForInventionParagraph,
    setAllUpdateModeForInventionParagraph
  ] = useState([]);

  const [allUpdateClaimParagraph, setAllUpdateClaimParagraph] = useState([]);

  const [savedFileContent, setSavedFileContent] = useState({
    content: "",
    textAreaValue: "",
    isInEditingMode: true
  });

  return (
    <UpdateParagraphContextProvider.Provider
      value={{
        allUpdateDisclosureParagraph,
        setAllUpdateDisclosureParagraph,
        allUpdateModeForInventionParagraph,
        setAllUpdateModeForInventionParagraph,
        allUpdateClaimParagraph,
        setAllUpdateClaimParagraph,
        savedFileContent,
        setSavedFileContent
      }}
    >
      {children}
    </UpdateParagraphContextProvider.Provider>
  );
};

export default UpdateParagraphContext;
