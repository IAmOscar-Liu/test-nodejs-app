import { extractTableElement } from "./extractTableElement";

export const extractSingleParagraph = (child, dataType) => {
  try {
    return TryExtractSingleParagraph(child);
  } catch (error) {
    return {
      general:
        (child && child.attributes && child.attributes.general) ||
        "無法得知第幾段",
      content: "",
      tables: []
    };
  }
};

const TryExtractSingleParagraph = (child) => {
  if (child.children.length > 1) {
    let content = ``;
    let tables = [];
    let tableCount = 0;
    child.children.forEach((d) => {
      try {
        if ((d.name === "sub" || d.name === "sup") && d.value === "") {
          content += d.children[0]
            ? d.children[0].value.replace(/[↵\n]/g, "").trim()
            : "";
        } else if (d.name === "br" && d.value === "") {
          content += "<br/>";
        } else if (d.type === "text" && d.value.length > 0) {
          content += d.value.replace(/[↵\n]/g, "").trim();
        } else if (d.name === "tables" && d.children.length > 0) {
          try {
            tables.push(extractTableElement(d));
            // console.log(extractTableElement(d));
            content += `@#%@table${tableCount}table@#%@`;
            tableCount++;
          } catch (error) {
            content += `<br/><span style="background-color: red">無法分析表格內容</span>`;
          }
        }
      } catch (error) {
        content = `<span style="background-color: red">無法分析本段落內容</span>`;
      }
    });
    return {
      general:
        (child && child.attributes && child.attributes.general) ||
        "無法得知第幾段",
      content,
      tables
    };
  }
  // console.log(`child.children.length = 1`, child.attributes.general);
  return {
    general:
      (child && child.attributes && child.attributes.general) ||
      "無法得知第幾段",
    content: child.children[0].value,
    tables: []
  };
};
