import { processData } from "../utils/processData";
import { checkFigureOfDrawings } from "../utils/checkFigureOfDrawings";
import { buildElementColorMap } from "../utils/buildElementColorMap";
import { modifyAllParagraph } from "../utils/modifyAllParagraph";
import { modifyAllClaims } from "../utils/modifyAllClaims";
import { generateErrorExp } from "../utils/generateErrorExp";

export const reInit = async (_essentialData, setEssentialData, payload) => {
  /*
    payload: {method, data}
  */

  console.log(`reInit data ${new Date().toString().slice(16, 24)}`);

  setEssentialData((prev) => ({
    ...prev,
    isProcessing: true,
    globalHighlightOn: true,
    globalHighlightElement: [],
    dbResultMap: {}
  }));

  const copyOfDisclosurePara = _essentialData.allDisclosureParagraphDetails;
  const copyOfModeForInventionPara =
    _essentialData.allModeForInventionParagraphDetails;
  const copyOfClaimDetails = _essentialData.allClaimsDetails;

  const essentialData = JSON.parse(JSON.stringify(_essentialData));

  /*
  essentialData = {
    ...essentialData,
    //isProcessing: true,
    //utilityModelTitle: "",
    //utilityModelTitleEn: "",
    //technicalField: [],
    //backgroundArt: [],
    //abstractContent: [],
    //abstractContentEn: [],
    descriptionOfElementMap: {},
    figureOfDrawingsMap: {},
    //failedDescriptionOfElementMap: [],
    //failedFigureOfDrawingsMap: [],
    elementColorMap: {},
    allDisclosureParagraphDetails: [],
    allModeForInventionParagraphDetails: [],
    allClaimsDetails: []
    //missingData: []
  }
  */

  essentialData.allErrors = {
    title: [],
    descriptionOfElementMap: [],
    figureOfDrawingsMap: [],
    allDisclosureParagraphDetails: [],
    allModeForInventionParagraphDetails: [],
    allClaimsDetails: [],
    system: []
  };

  if (payload.method === "description-of-element") {
    essentialData.descriptionOfElementMap = {};
    essentialData.failedDescriptionOfElementMap = [];
  }

  if (payload.method === "figure-drawings") {
    essentialData.figureOfDrawingsMap = {};
    essentialData.failedFigureOfDrawingsMap = [];
  }

  if (
    payload.method === "description-of-element" ||
    payload.method === "figure-drawings"
  ) {
    essentialData.elementColorMap = {};
    essentialData.allDisclosureParagraphDetails = [];
    essentialData.allModeForInventionParagraphDetails = [];
    essentialData.allClaimsDetails = [];
  }

  if (payload.method === "allClaimsDetails") {
    essentialData.allClaimsDetails = [];
  }

  // processAbstract(XMLData.abstractData, essentialData);
  // processAbstract(XMLData.abstractDataEn, essentialData);

  // processTFAndBA(XMLData.technicalFieldData, essentialData, "technical-field");
  // processTFAndBA(XMLData.backgroundArtData, essentialData, "background-art");

  if (payload.method === "description-of-element") {
    processData(
      null,
      "description-of-element",
      essentialData,
      null,
      payload.data
    );
    processData(
      null,
      "figure-drawings",
      essentialData,
      essentialData.figureOfDrawingsMap,
      null
    );
  }

  if (payload.method === "figure-drawings") {
    processData(
      null,
      "description-of-element",
      essentialData,
      essentialData.descriptionOfElementMap,
      null
    );
    processData(null, "figure-drawings", essentialData, null, payload.data);
  }

  // show warning message
  if (
    essentialData.failedDescriptionOfElementMap.length > 0 ||
    essentialData.failedFigureOfDrawingsMap.length > 0
  ) {
    window.alert(
      "符號說明或代表圖之符號簡單說明存在有無法分辨別的元件，後續分析時將忽略這些元件，若想得到更精準的結果，建議修正此元件後再重新分析。"
    );
  }

  if (
    payload.method === "description-of-element" ||
    payload.method === "figure-drawings"
  ) {
    checkFigureOfDrawings(essentialData);
    buildElementColorMap(essentialData);
    modifyAllParagraph(
      null,
      "allModeForInventionParagraphDetails",
      -1,
      essentialData,
      copyOfModeForInventionPara
    );
    modifyAllParagraph(
      null,
      "allDisclosureParagraphDetails",
      -1,
      essentialData,
      copyOfDisclosurePara
    ); // in Reactjs, pass essentialData and setEssentialData
  }

  if (payload.method === "allModeForInventionParagraphDetails") {
    modifyAllParagraph(
      null,
      "allModeForInventionParagraphDetails",
      payload.data,
      essentialData,
      copyOfModeForInventionPara
    );
    modifyAllParagraph(
      null,
      "allDisclosureParagraphDetails",
      -1,
      essentialData,
      copyOfDisclosurePara
    ); // in Reactjs, pass essentialData and setEssentialData
    essentialData.allModeForInventionParagraphDetails = essentialData.allModeForInventionParagraphDetails.map(
      (para) => ({ ...para, isCollapse: true })
    );
  }

  if (payload.method === "allDisclosureParagraphDetails") {
    modifyAllParagraph(
      null,
      "allModeForInventionParagraphDetails",
      -1,
      essentialData,
      copyOfModeForInventionPara
    );
    modifyAllParagraph(
      null,
      "allDisclosureParagraphDetails",
      payload.data,
      essentialData,
      copyOfDisclosurePara
    ); // in Reactjs, pass essentialData and setEssentialData
    essentialData.allDisclosureParagraphDetails = essentialData.allDisclosureParagraphDetails.map(
      (para) => ({ ...para, isCollapse: true })
    );
  }

  let newClaimPayload = [];
  let manuallyAddValues = [...essentialData.preserveValues];
  if (payload.method !== "allClaimsDetails") {
    await modifyAllClaims(null, -1, essentialData, copyOfClaimDetails, []);
  } else {
    newClaimPayload = payload.data.map((payload, payloadIdx) => {
      if (
        payload.claimNum === null &&
        payload.content === null &&
        payload.matches === null
      ) {
        if (
          essentialData.claimPayload[payloadIdx]?.claimNum ||
          essentialData.claimPayload[payloadIdx]?.content ||
          essentialData.claimPayload[payloadIdx]?.matches
        ) {
          return essentialData.claimPayload[payloadIdx];
        }
        return payload;
      }
      if (payload.matches) {
        payload.matches.forEach((mt) => {
          if (
            mt.preserveValue &&
            !manuallyAddValues.find((v) => v === mt.value)
          ) {
            manuallyAddValues.push(mt.value);
          }
        });
      }
      return payload;
    });
    // console.log(newClaimPayload);
    // console.log(manuallyAddValues);
    // debugger;
    // modifyAllClaims(null, payload.data, essentialData, copyOfClaimDetails);
    await modifyAllClaims(
      null,
      newClaimPayload,
      essentialData,
      copyOfClaimDetails,
      manuallyAddValues
    );
    console.log("allClaimsDetails", essentialData.allClaimsDetails);
  }

  generateErrorExp(essentialData);

  // console.log("debug essentialData");
  // console.log(essentialData);
  // debugger;

  // For Test
  // console.log("Abstract", essentialData.abstractContent.join(/[↵\n]/));
  // console.log("descriptionOfElementMap", essentialData.descriptionOfElementMap);
  // console.log("figureOfDrawingsMap", essentialData.figureOfDrawingsMap);
  // console.log(
  //   "failedDescriptionOfElementMap",
  //   essentialData.failedDescriptionOfElementMap
  // );
  // console.log(
  //   "failedFigureOfDrawingsMap",
  //   essentialData.failedFigureOfDrawingsMap
  // );
  // console.log(
  //   "allDisclosureParagraphDetails",
  //   essentialData.allDisclosureParagraphDetails
  // );
  // console.log(
  //   "allModeForInventionParagraphDetails",
  //   essentialData.allModeForInventionParagraphDetails
  // );
  // console.log("elementColorMap", essentialData.elementColorMap);
  // console.log("allClaimsDetails", essentialData.allClaimsDetails);
  // For Test Ene

  console.log(`Write new data ${new Date().toString().slice(16, 24)}`);
  setEssentialData({
    ...essentialData,
    isProcessing: false,
    claimPayload: newClaimPayload,
    preserveValues: [...essentialData.preserveValues, ...manuallyAddValues],
    searchString: ""
  });
};
