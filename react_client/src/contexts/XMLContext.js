import React, { createContext, useState } from "react";

export const XMLContextProvider = createContext();

const XMLContext = ({ children }) => {
  const [XMLData, setXMLData] = useState({
    fileName: "", // abc.xml
    fileContent: null,
    isLoading: false,
    isXMLFormatOK: true,
    utilityModelTitleData: "",
    utilityModelTitleDataEn: "",
    applicationNum: "",
    technicalFieldData: {},
    backgroundArtData: {},
    abstractData: {},
    abstractDataEn: {},
    descriptionOfElementData: {},
    figureDrawingsData: {},
    disclosureData: {},
    modeForInventionData: {},
    claimsData: {},
    drawingsData: {},
    drawingsDescriptionData: {}
  });

  return (
    <XMLContextProvider.Provider value={[XMLData, setXMLData]}>
      {children}
    </XMLContextProvider.Provider>
  );
};

export default XMLContext;
