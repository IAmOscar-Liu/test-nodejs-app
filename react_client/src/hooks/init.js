import { useEffect } from "react";
import { processAbstract } from "../utils/processAbstract";
import { processData } from "../utils/processData";
import { checkFigureOfDrawings } from "../utils/checkFigureOfDrawings";
import { buildElementColorMap } from "../utils/buildElementColorMap";
import { modifyAllParagraph } from "../utils/modifyAllParagraph";
import { modifyAllClaims } from "../utils/modifyAllClaims";
import { processTFAndBA } from "../utils/processTFAndBA";
import { generateErrorExp } from "../utils/generateErrorExp";
import { checkDrawings } from "../utils/checkDrawings";

export const useInit = (
  XMLData,
  setXMLData,
  _essentialData,
  setEssentialData,
  setAllUpdateDisclosureParagraph,
  setAllUpdateModeForInventionParagraph,
  setAllUpdateClaimParagraph
) => {
  const handler = async () => {
    if (!XMLData.isLoading) {
      const isDataCompleted =
        Object.keys(XMLData.abstractData).length !== 0 &&
        Object.keys(XMLData.descriptionOfElementData).length !== 0 &&
        Object.keys(XMLData.figureDrawingsData).length !== 0 &&
        Object.keys(XMLData.disclosureData).length !== 0 &&
        Object.keys(XMLData.modeForInventionData).length !== 0 &&
        Object.keys(XMLData.claimsData).length !== 0;

      if (isDataCompleted) {
        // 該 xml 的文件齊備
        // Deep copy essentialData to make it easy to be modified
        const essentialData = JSON.parse(JSON.stringify(_essentialData));
        console.log(`Get Started ${new Date().toString().slice(16, 24)}`);

        // utilityModelTitle: "",
        // utilityModelTitleEn: "",
        // utilityModelTitleData: "",
        //utilityModelTitleDataEn: "",
        essentialData.applicationNum = XMLData.applicationNum;
        essentialData.utilityModelTitle = XMLData.utilityModelTitleData;
        essentialData.utilityModelTitleEn = XMLData.utilityModelTitleDataEn;

        processAbstract(XMLData.abstractData, essentialData);
        processAbstract(XMLData.abstractDataEn, essentialData);

        processTFAndBA(
          XMLData.technicalFieldData,
          essentialData,
          "technical-field"
        );
        processTFAndBA(
          XMLData.backgroundArtData,
          essentialData,
          "background-art"
        );

        processData(
          XMLData.descriptionOfElementData,
          "description-of-element",
          essentialData,
          null,
          null
        );
        processData(
          XMLData.figureDrawingsData,
          "figure-drawings",
          essentialData,
          null,
          null
        );
        // show warning message
        if (
          essentialData.failedDescriptionOfElementMap.length > 0 ||
          essentialData.failedFigureOfDrawingsMap.length > 0
        ) {
          window.alert(
            "符號說明或代表圖之符號簡單說明存在有無法分辨別的元件，後續分析時將忽略這些元件，若想得到更精準的結果，建議修正此元件後再重新分析。"
          );
        }
        checkFigureOfDrawings(essentialData);
        buildElementColorMap(essentialData);

        // console.log(essentialData);
        // debugger;

        checkDrawings(
          XMLData.drawingsData,
          XMLData.drawingsDescriptionData,
          essentialData
        );

        // allAbstractParagraphDetails: [],
        modifyAllParagraph(
          XMLData.abstractData,
          "allAbstractParagraphDetails",
          -1,
          essentialData,
          null
        );

        // allTechnicalFieldParagraphDetails: [],
        modifyAllParagraph(
          XMLData.technicalFieldData,
          "allTechnicalFieldParagraphDetails",
          -1,
          essentialData,
          null
        );

        // allBackgroundArtParagraphDetails: [],
        modifyAllParagraph(
          XMLData.backgroundArtData,
          "allBackgroundArtParagraphDetails",
          -1,
          essentialData,
          null
        );

        modifyAllParagraph(
          XMLData.modeForInventionData,
          "allModeForInventionParagraphDetails",
          -1,
          essentialData,
          null
        );
        modifyAllParagraph(
          XMLData.disclosureData,
          "allDisclosureParagraphDetails",
          -1,
          essentialData,
          null
        ); // in Reactjs, pass essentialData and setEssentialData

        await modifyAllClaims(XMLData.claimsData, -1, essentialData, null, []);
        // 產生新型例稿
        generateErrorExp(essentialData);

        // For Test
        // console.log("Abstract", essentialData.abstractContent.join("\n"));
        console.log(
          "descriptionOfElementMap",
          essentialData.descriptionOfElementMap
        );
        console.log("figureOfDrawingsMap", essentialData.figureOfDrawingsMap);
        console.log(
          "failedDescriptionOfElementMap",
          essentialData.failedDescriptionOfElementMap
        );
        console.log(
          "failedFigureOfDrawingsMap",
          essentialData.failedFigureOfDrawingsMap
        );

        // allAbstractParagraphDetails: []
        console.log(
          "allAbstractParagraphDetails",
          essentialData.allAbstractParagraphDetails
        );
        // allTechnicalFieldParagraphDetails: [],
        console.log(
          "allTechnicalFieldParagraphDetails",
          essentialData.allTechnicalFieldParagraphDetails
        );
        // allBackgroundArtParagraphDetails: [],
        console.log(
          "allBackgroundArtParagraphDetails",
          essentialData.allBackgroundArtParagraphDetails
        );

        console.log(
          "allDisclosureParagraphDetails",
          essentialData.allDisclosureParagraphDetails
        );
        console.log(
          "allModeForInventionParagraphDetails",
          essentialData.allModeForInventionParagraphDetails
        );
        console.log("elementColorMap", essentialData.elementColorMap);
        console.log("allClaimsDetails", essentialData.allClaimsDetails);
        console.log("allErrors", essentialData.allErrors);
        // For Test Ene

        console.log(`Write new data ${new Date().toString().slice(16, 24)}`);
        setEssentialData({
          ...essentialData,
          isProcessing: false,
          // utilityModelTitle: XMLData.utilityModelTitleData,
          // utilityModelTitleEn: XMLData.utilityModelTitleDataEn,
          dragAreaMsg: `你的檔案${XMLData.fileName.slice(
            6
          )}已成功上傳，你可以點擊此處再次選擇檔案。`
        });
      } else if (!isDataCompleted && XMLData.fileName !== "") {
        // 該 xml 的文件不齊備
        console.log(`sth missing... ${new Date().toString().slice(16, 24)}`);
        let missingData = [];
        if (Object.keys(XMLData.abstractData).length === 0) {
          missingData.push("摘要(abstract)");
        }
        if (Object.keys(XMLData.descriptionOfElementData).length === 0) {
          missingData.push("符號說明(description-of-element)");
        }
        if (Object.keys(XMLData.figureDrawingsData).length === 0) {
          missingData.push("代表圖之符號簡單說明(figure-drawings)");
        }
        if (Object.keys(XMLData.disclosureData).length === 0) {
          missingData.push("發明內容(disclosure)");
        }
        if (Object.keys(XMLData.modeForInventionData).length === 0) {
          missingData.push("實施方式(mode-for-invention)");
        }
        if (Object.keys(XMLData.claimsData).length === 0) {
          missingData.push("請求項(claims)");
        }
        const dragAreaMsg = XMLData.isXMLFormatOK
          ? `請確認你的檔案${XMLData.fileName.slice(
              6
            )}具備完整的內容後再重新上傳。`
          : "該XML檔的格式有誤無法讀取，請檢查格式是否正確。";
        window.alert(
          XMLData.isXMLFormatOK
            ? `你的檔案${XMLData.fileName.slice(
                6
              )}缺少部分內容，請備妥欠缺的內容後再重新上傳。`
            : dragAreaMsg
        );
        setEssentialData((prev) => ({
          ...prev,
          isProcessing: false,
          missingData,
          dragAreaMsg
        }));
      }
    }
  };

  useEffect(() => {
    if (!_essentialData.isProcessing && XMLData.isLoading) {
      console.log(`reset everything ${new Date().toString().slice(16, 24)}`);
      setEssentialData((prev) => ({
        ...prev,
        isProcessing: true,
        applicationNum: "",
        utilityModelTitle: "",
        utilityModelTitleEn: "",
        technicalField: [],
        backgroundArt: [],
        abstractContent: [],
        abstractContentEn: [],
        descriptionOfElementMap: {},
        figureOfDrawingsMap: {},
        failedDescriptionOfElementMap: [],
        failedFigureOfDrawingsMap: [],
        elementColorMap: {},
        allAbstractParagraphDetails: [],
        allTechnicalFieldParagraphDetails: [],
        allBackgroundArtParagraphDetails: [],
        allDisclosureParagraphDetails: [],
        allModeForInventionParagraphDetails: [],
        allClaimsDetails: [],
        allDrawings: [],
        allDrawingsDescription: [],
        missingData: [],
        claimPayload: [],
        preserveValues: [],
        searchString: "",
        allErrors: {
          title: [],
          descriptionOfElementMap: [],
          figureOfDrawingsMap: [],
          allDisclosureParagraphDetails: [],
          allModeForInventionParagraphDetails: [],
          allClaimsDetails: [],
          system: []
        },
        globalHighlightOn: true,
        globalHighlightElement: [],
        synchronizeHighlight: false,
        dbResultMap: {}
      }));
      setAllUpdateDisclosureParagraph([]);
      setAllUpdateModeForInventionParagraph([]);
      setAllUpdateClaimParagraph([]);
    }

    handler();
  }, [XMLData]);

  return null;
};
