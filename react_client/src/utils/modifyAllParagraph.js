import { extractSingleParagraph } from "./extractSingleParagraph";
import { modifySingleParagraph } from "./modifySingleParagraph";
import { handleSpecialChar } from "./handleSpecialChar";
import { stringToUnicode } from "./stringToUnicode";
import { symetricPrefix } from "../dict/allReferWords";
import { pickColor } from "../dict/elementColors";
import { allSymbolChar } from "../dict/keyRegs";

export const modifyAllParagraph = (
  data,
  dataType,
  whichOne,
  essentialData,
  oldDataBodies
) => {
  let dataBodies = [];
  if (typeof whichOne === "number" && oldDataBodies) {
    dataBodies = oldDataBodies.map((oldData) => ({
      general: oldData.general,
      content: oldData.content,
      tables: oldData.tables
    }));
  } else if (typeof whichOne === "number" && oldDataBodies === null) {
    dataBodies = data.children.map((child, _ii) => {
      if (dataType === "allAbstractParagraphDetails") {
        return {
          ...extractSingleParagraph(child.children[0]),
          general: `摘要:第${_ii + 1}段`
        };
      } else if (dataType === "allTechnicalFieldParagraphDetails") {
        const p = extractSingleParagraph(child);
        p.general = `技術領域【${p.general}】`;
        return p;
      } else if (dataType === "allBackgroundArtParagraphDetails") {
        const p = extractSingleParagraph(child);
        p.general = `先前技術【${p.general}】`;
        return p;
      } else {
        return extractSingleParagraph(child);
      }
    });
  } else {
    // update some paragraphs
    // console.log("Update some paragraph");
    dataBodies = whichOne.map(({ content, general, isDelete }, pIdx) => {
      if (isDelete) {
        return { isDelete };
      } else if (content || general) {
        return {
          general:
            general ||
            (oldDataBodies[pIdx] && oldDataBodies[pIdx].general) ||
            "無法得知第幾段",
          content:
            content ||
            (oldDataBodies[pIdx] && oldDataBodies[pIdx].content) ||
            "無內容。",
          tables: (oldDataBodies[pIdx] && oldDataBodies[pIdx].tables) || [],
          isUpdated: true
        };
      }
      return {
        general: oldDataBodies[pIdx].general,
        content: oldDataBodies[pIdx].content,
        tables: oldDataBodies[pIdx].tables
      };
    });
  }
  // allTechnicalFieldParagraphDetails: [],
  // allBackgroundArtParagraphDetails: [],

  // Test
  /*
  if (
    dataType === "allAbstractParagraphDetails" ||
    dataType === "allTechnicalFieldParagraphDetails" ||
    dataType === "allBackgroundArtParagraphDetails"
  ) {
    console.log(dataType);
    console.log(dataBodies);
    debugger;
  }
  */

  findKeyWords(dataBodies, dataType, whichOne, essentialData);
};

function findKeyWords(data, dataType, whichOne, essentialData) {
  let regExps = [];
  let regExpsOrigin = [];
  let concatRegExps = {};
  let regExp = ``;
  let concatRegExp = ``;
  let concatSymRegExp = ``;
  let regExpWithWrongChar = ``;
  let regExpBackup = ``;
  let regExpWithWrongCharbackup = ``;

  // Create regExp for find matches
  const {
    applicationNum,
    descriptionOfElementMap,
    utilityModelTitle,
    elementColorMap,
    figureOfDrawingsMap,
    allDrawings
  } = essentialData;

  const allElements = Object.keys(descriptionOfElementMap)
    .filter((key) => descriptionOfElementMap[key].status !== "key duplicate")
    .reduce(
      (acc, cur) => [
        ...acc,
        ...descriptionOfElementMap[cur].values.map((value) => ({
          key: cur,
          value,
          from: "d"
        }))
      ],
      []
    );

  Object.keys(figureOfDrawingsMap)
    .filter((key) => figureOfDrawingsMap[key].status !== "key duplicate")
    .forEach((key) =>
      figureOfDrawingsMap[key].values.forEach((v, vIdx) => {
        if (
          !allElements.find((allEl) => allEl.key === key && allEl.value === v)
        ) {
          allElements.push({
            key,
            value: v,
            from: "f"
          });

          if (vIdx === 0 && !elementColorMap[stringToUnicode(v)]) {
            elementColorMap[stringToUnicode(v)] = {
              value: v,
              color: pickColor(Object.keys(elementColorMap).length)
            };
          }
        }
      })
    );

  allElements.sort((a, b) => b.value.length - a.value.length);

  const utilityModelTitleValue = utilityModelTitle.replace(/[↵\n]/g, "").trim();

  if (
    utilityModelTitle &&
    utilityModelTitle !== "" &&
    !allElements.find((el) => utilityModelTitleValue.endsWith(el.value))
  ) {
    allElements.push({
      key: "utilityModelTitle",
      value: utilityModelTitleValue,
      from: "t"
    });
    if (!elementColorMap[stringToUnicode(utilityModelTitleValue)]) {
      elementColorMap[stringToUnicode(utilityModelTitleValue)] = {
        value: utilityModelTitleValue,
        color: pickColor(Object.keys(elementColorMap).length)
      };
    }
    // console.log(elementColorMap);
    // debugger;
  }

  // console.log(allElements);
  // debugger;

  allElements
    // .sort((a, b) => b.value.length - a.value.length)
    .forEach(({ key, value, from }) => {
      if (regExps.includes(value) || value === "") {
        return;
      }

      if (/^第./.test(value)) {
        // concatRegExps.push({front: value.slice(0, 2), main: value.slice(2)});
        if (concatRegExps[stringToUnicode(value.slice(2))]) {
          concatRegExps[stringToUnicode(value.slice(2))].prefixes.push(
            value.slice(0, 2)
          );
        } else {
          concatRegExps[stringToUnicode(value.slice(2))] = {
            prefixes: [value.slice(0, 2)],
            main: value.slice(2),
            symetric: false
          };
        }
      } else if (RegExp(`^[${symetricPrefix()}]`).test(value)) {
        // 上、下連接件
        if (concatRegExps[stringToUnicode(value.slice(1))]) {
          concatRegExps[stringToUnicode(value.slice(1))].prefixes.push(
            value.slice(0, 1)
          );
        } else {
          concatRegExps[stringToUnicode(value.slice(1))] = {
            prefixes: [value.slice(0, 1)],
            main: value.slice(1),
            symetric: true
          };
        }
      }

      regExps.unshift(handleSpecialChar(value));
      regExpsOrigin.unshift({ key, value, from });
      // do some backup in case that error occurs
      regExpBackup = regExp;
      regExpWithWrongCharbackup = regExpWithWrongChar;
      try {
        // console.log("regExps[0]", regExps[0]);
        if (
          regExps[0].length >= 3 &&
          !(
            regExps[0].includes("[\\u4E00-\\u9FFF]") ||
            regExps[0].includes("\\/") ||
            regExps[0].includes("\\(") ||
            regExps[0].includes("\\)")
          )
        ) {
          for (let i = 0; i < regExps[0].length; i++) {
            // const replaceReg =
            //   regExps[0][i] === "/" ||
            //   regExps[0][i] === "(" ||
            //   regExps[0][i] === ")"
            //     ? `\\${regExps[0][i]}`
            //     : `[\\u4E00-\\u9FFF]`;

            regExpWithWrongChar +=
              [
                regExps[0].slice(0, i),
                `[\\u4E00-\\u9FFF]`,
                regExps[0].slice(i + 1)
              ].join("") + "|";
          }
        } /* else {
          regExpWithWrongChar += regExps[0] + "|";
        } */
        regExp += regExps[0] + "|";
        const test1 = `(${regExp.slice(
          0,
          regExp.length - 1
        )})([${allSymbolChar}'-~]*)`.replaceAll("\\", "\\\\");
        const test2 = `(${regExpWithWrongChar.slice(
          0,
          regExpWithWrongChar.length - 1
        )})([${allSymbolChar}'-~]*)`.replaceAll("\\", "\\\\");
        RegExp(test1, `ig`);
        RegExp(test2, `ig`);
      } catch (err) {
        console.log(`RegExp goes wrong: ${regExps[0]}`);
        regExp = regExpBackup;
        regExpWithWrongChar = regExpWithWrongCharbackup;
      }
      // regExp += regExps[0] + "|";
    });

  Object.values(concatRegExps)
    .filter((v) => v.prefixes.length > 1)
    .sort((a, b) => b.main.length - a.main.length)
    .forEach(({ main, symetric }) => {
      if (symetric) {
        concatSymRegExp += main + "|";
      } else {
        concatRegExp += main + "|";
      }
    });

  // console.log(utilityModelTitle);
  // console.log("regExp");
  // console.log(regExp.slice(0, regExp.length - 1));
  // console.log("regExpWithWrongChar");
  // console.log(regExpWithWrongChar.slice(0, regExpWithWrongChar.length - 1));
  // console.log(regExpsOrigin);
  // debugger;

  regExp = regExp.slice(0, regExp.length - 1);
  concatRegExp = concatRegExp.slice(0, concatRegExp.length - 1);
  concatSymRegExp = concatSymRegExp.slice(0, concatSymRegExp.length - 1);
  regExpWithWrongChar = regExpWithWrongChar.slice(
    0,
    regExpWithWrongChar.length - 1
  );

  // console.log(regExp);
  // debugger;

  // Modify Each paragraph
  if (whichOne === -1) {
    data.forEach(({ general, content, tables }) => {
      essentialData[dataType].push(
        modifySingleParagraph(
          applicationNum,
          general,
          content,
          tables,
          regExp,
          concatRegExp,
          concatSymRegExp,
          regExpsOrigin,
          regExpWithWrongChar,
          descriptionOfElementMap,
          figureOfDrawingsMap,
          allDrawings,
          dataType
        )
      );
    }); // for each paragraph
    essentialData[dataType].sort(
      (a, b) => parseInt(a.general) - parseInt(b.general)
    );
  } else {
    for (let idx = data.length - 1; idx >= 0; idx--) {
      const { general, content, tables, isUpdated, isDelete } = data[idx];
      if (isDelete) {
        essentialData[dataType].splice(idx, 1);
      } else if (isUpdated) {
        essentialData[dataType][idx] = modifySingleParagraph(
          applicationNum,
          general,
          content,
          tables,
          regExp,
          concatRegExp,
          concatSymRegExp,
          regExpsOrigin,
          regExpWithWrongChar,
          descriptionOfElementMap,
          figureOfDrawingsMap,
          allDrawings,
          dataType
        );
      }
    }
    essentialData[dataType].sort(
      (a, b) => parseInt(a.general) - parseInt(b.general)
    );
  }
}
