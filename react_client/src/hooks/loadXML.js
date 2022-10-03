import { useEffect } from "react";

import XmlReader from "xml-reader";
// import fs from "fs";
// import path from "path";
import { getPatentTitle } from "../utils/getPatentTitle";
// import { XMLContextProvider } from "../contexts/XMLContext";

export const useLoadXML = (XMLFileName, XMLFileContent, setXMLData) => {
  // const [_, setXMLData] = useContext(XMLContextProvider);

  useEffect(() => {
    if (XMLFileName !== "") {
      console.log(
        `Start loading xml ${XMLFileName} ${new Date()
          .toString()
          .slice(16, 24)}`
      );
      setXMLData((prev) => ({
        ...prev,
        isLoading: true,
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
        drawingsData: {}
      }));

      try {
        const reader = XmlReader.create();
        // const xml = fs.readFileSync(path.join(__dirname, "test6.xml"), 'utf8');
        const xml = XMLFileContent;
        // XMLFileContent ||
        // fs.readFileSync(
        //   path.join(__dirname, `../patents/${XMLFileName.slice(6)}`),
        //   "utf8"
        // );
        // invention-specification

        // 發明: tag:invention-specification
        // 新型改成 tag:utility-model-specification
        reader.on("tag:invention-specification", (data) => {
          setXMLData((prev) => ({
            ...prev,
            applicationNum:
              (data && data.attributes && data.attributes["application-num"]) ||
              ""
          }));
        });
        reader.on("tag:utility-model-specification", (data) => {
          setXMLData((prev) => ({
            ...prev,
            applicationNum:
              (data && data.attributes && data.attributes["application-num"]) ||
              ""
          }));
        });

        // 發明: tag:invention-title
        // 新型改成 tag:utility-model-title
        reader.on("tag:invention-title", (data) => {
          console.log("get invention-title");
          getPatentTitle(data, setXMLData);
        });
        reader.on("tag:utility-model-title", (data) => {
          console.log("get utility-title");
          getPatentTitle(data, setXMLData);
        });

        reader.on("tag:abstract", (data) => {
          if (data.attributes.lang === "tw") {
            setXMLData((prev) => ({ ...prev, abstractData: data }));
          }
          if (data.attributes.lang === "en") {
            setXMLData((prev) => ({ ...prev, abstractDataEn: data }));
          }
        });
        reader.on("tag:technical-field", (data) => {
          setXMLData((prev) => ({ ...prev, technicalFieldData: data }));
        });
        reader.on("tag:background-art", (data) => {
          setXMLData((prev) => ({ ...prev, backgroundArtData: data }));
        });
        reader.on("tag:description-of-element", (data) => {
          setXMLData((prev) => ({ ...prev, descriptionOfElementData: data }));
        }); //符號說明
        reader.on("tag:figure-drawings", (data) =>
          setXMLData((prev) => ({ ...prev, figureDrawingsData: data }))
        ); // 指定代表圖符號

        reader.on("tag:drawings", (data) =>
          setXMLData((prev) => ({ ...prev, drawingsData: data }))
        ); // 圖式

        reader.on("tag:description-of-drawings", (data) =>
          setXMLData((prev) => ({ ...prev, drawingsDescriptionData: data }))
        ); // 圖式簡單說明明

        reader.on("tag:disclosure", (data) =>
          setXMLData((prev) => ({ ...prev, disclosureData: data }))
        ); // 發明內容
        reader.on("tag:mode-for-invention", (data) =>
          setXMLData((prev) => ({ ...prev, modeForInventionData: data }))
        ); // 實施方式
        reader.on("tag:claims", (data) =>
          setXMLData((prev) => ({ ...prev, claimsData: data }))
        ); // 申請專利範圍

        reader.parse(xml);

        reader.reset();

        setXMLData((prev) => ({
          ...prev,
          isLoading: false,
          isXMLFormatOK: true
        }));
      } catch (error) {
        console.log(error);
        setXMLData((prev) => ({
          ...prev,
          isLoading: false,
          isXMLFormatOK: false
        }));
        window.alert("該XML檔的格式有誤無法讀取，請檢查格式是否正確。");
      }
    }

    return () => {};
  }, [XMLFileName, XMLFileContent, setXMLData]);

  return null;
};
