export const processTFAndBA = (data, essentialData, dataType) => {
  try {
    tryToProcessTFAndBA(data, essentialData, dataType);
  } catch (error) {
    if (dataType === "technical-field") {
      essentialData.technicalField.push({
        singlePara: "Sorry! 技術領域內容無法分析...",
        general: ""
      });
    } else {
      essentialData.backgroundArt.push({
        singlePara: "Sorry! 先前技術內容無法分析...",
        general: ""
      });
    }
  }
};

const tryToProcessTFAndBA = (data, essentialData, dataType) => {
  const TFOrBA = data.children;
  TFOrBA.forEach((paragraph, pIndex) => {
    let singlePara = "";
    let general = "";
    try {
      const elements = paragraph.children;
      // console.log(paragraph);
      general = paragraph.attributes.general || "";

      for (let i = 0; i < elements.length; i++) {
        if (
          (elements[i].name === "sub" || elements[i].name === "sup") &&
          elements[i].value === "" &&
          elements[i].children.length > 0 &&
          elements[i].children[0].value > 0
        ) {
          singlePara += elements[i].children[0].value
            .replace(/[↵\n]/g, "")
            .trim();
        } else if (
          elements[i].type === "text" &&
          elements[i].value.length > 0
        ) {
          singlePara += elements[i].value.replace(/[↵\n]/g, "").trim();
        }
      }
    } catch (error) {
      singlePara = `無法分析段落${pIndex}}`;
    } finally {
      if (dataType === "technical-field") {
        essentialData.technicalField.push({ singlePara, general });
      } else {
        essentialData.backgroundArt.push({ singlePara, general });
      }
    }
  });
};
