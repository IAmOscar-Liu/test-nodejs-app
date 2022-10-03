export const processAbstract = (data, essentialData) => {
  try {
    tryToProcessAbstract(data, essentialData);
  } catch (e) {
    if (data && data.attributes && data.attributes.lang === "tw") {
      essentialData.abstractContent.push("Sorry! 中文摘要內容無法分析...");
    } else if (data && data.attributes && data.attributes.lang === "en") {
      essentialData.abstractContentEn.push("Sorry! 英文摘要內容無法分析...");
    }
  }
};

const tryToProcessAbstract = (data, essentialData) => {
  const allParas = data.children[0].children;

  allParas.forEach((paragraph, index) => {
    let singlePara = "";
    try {
      const elements = paragraph.children;
      for (let i = 0; i < elements.length; i++) {
        if (
          elements[i].name === "sub" &&
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
      singlePara = `段落${index}無法分析}`;
    } finally {
      // singlePara = `<P>${singlePara}</p>`;
      if (data.attributes.lang === "tw") {
        essentialData.abstractContent.push(singlePara);
      } else {
        essentialData.abstractContentEn.push(singlePara);
      }
    }
  });
  // console.log(essentialData.abstractContent.join(/[↵\n]/g))
};
