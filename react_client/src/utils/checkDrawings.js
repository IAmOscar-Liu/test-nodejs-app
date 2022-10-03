import { figStartMatch } from "../dict/figReg";
import { extractTableElement_v2 } from "./extractTableElement";
import { getKeyInRange } from "./otherUtils";

export const checkDrawings = (drawings, drawingsDescription, essentialData) => {
  const [error, data] = tryCheckDrawingsDescription(drawingsDescription);

  if (!error) {
    essentialData.allDrawingsDescription = data;
  }

  // console.log(data);
  // debugger;

  /*const [error2, data2] = tryCheckDrawings(drawings);

  if (!error2) {
    essentialData.allDrawings = data2.map((fig) => ({
      fig,
      descripion:
        data1.find(({ figs }) => figs.find((f) => f === fig))?.description ||
        "找不到對應的圖式簡單說明"
    }));
  }*/

  const allDrawingsMap = {};
  let duplicateCount = 1;
  data.forEach(({ figs, description }) => {
    figs.forEach((fig) => {
      if (!allDrawingsMap[fig]) {
        allDrawingsMap[fig] = { description, status: "OK" };
      } else {
        allDrawingsMap[fig + "_duplicate_" + duplicateCount] = {
          description,
          status: "duplicate"
        };
        duplicateCount++;
      }
    });
  });

  essentialData.allDrawings = Object.entries(allDrawingsMap).map(
    ([key, value]) => ({
      fig: key,
      description: value.description,
      status: value.status
    })
  );

  if (essentialData.allDrawings.length === 0)
    essentialData.allDrawings = [{ fig: "no figs" }];

  console.log(essentialData.allDrawings);
  // debugger;
};

const tryCheckDrawingsDescription = (drawingsDescription) => {
  /* console.log(
    drawingsDescription.children[
      drawingsDescription.children.length - 1
    ].children
      .filter((child) => child.type === "text" && child.value !== "")
      .map((p) => p.value.replace(/[↵\n]/g, "").trim())
  );
  debugger; */
  try {
    /* return [
      null,
      drawingsDescription.children[
        drawingsDescription.children.length - 1
      ].children
        .filter((child) => child.type === "text" && child.value !== "")
        .map((p) => p.value.replace(/[↵\n]/g, "").trim())
        .map((description) => ({
          description,
          figs: getFigByDescription(description)
        }))
    ]; */
    const allDescriptions = getDescriptions(drawingsDescription)
      .split("@##@")
      .filter((p) => p !== "")
      .map((description) => ({
        description,
        figs: getFigByDescription(description)
      }));

    // console.log(allDescriptions);
    // debugger;

    return [null, allDescriptions];
  } catch (e) {
    return [e.message, []];
  }
};

const getDescriptions = (element) => {
  if (element.name === "description-of-element") return "";

  if (element.type === "text") {
    return element.value.replace(/[↵\n]/g, "").trim();
  }

  if (element.name === "br" && element.type === "element") {
    return "@##@";
  }

  if (element.name === "table" && element.type === "element") {
    return "@##@" + extractTableElement_v2(element);
  }

  let descriptionStr = "";
  element.children.forEach((child) => {
    if (child.name === "p" && child.type === "element") {
      descriptionStr += "@##@" + getDescriptions(child);
    } else {
      descriptionStr += getDescriptions(child);
    }
  });
  return descriptionStr;
};

const getFigByDescription = (description) => {
  // if (/^[[({〔]/.test(description)) description = description.slice(1);
  const descriptionMatch = description.match(/^[^\u4E00-\u9FFF]+/);
  if (description.match(/^[^\u4E00-\u9FFF]+/)) {
    description = description.slice(descriptionMatch[0].length);
  }

  const figMatch = figStartMatch(description);

  if (!figMatch) return [];

  let keys = figMatch[0]
    .replaceAll(/第|圖/g, "")
    .replaceAll(/[()]/g, "")
    .split(/[、，,或與和以及跟]/)
    .filter((e) => e !== "")
    .map((k) => k.trim());

  if (keys.some((curKey) => /.+[-~～到至].+/.test(curKey))) {
    keys = keys.reduce((accKeys, curKey) => {
      if (/.+[-~～到至].+/.test(curKey)) {
        return [...accKeys, ...getKeyInRange(curKey, true)];
      }
      return [...accKeys, curKey];
    }, []);
  }

  return keys.map((k) => "圖" + k);
};
