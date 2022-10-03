import { symetricPrefix } from "../dict/allReferWords";
import { keyStartMatch, allSymbolChar, isKeyValid } from "../dict/keyRegs";
import { checkClaimConnection } from "./checkClaimConnection";
import { extractSingleClaim } from "./extractSingleClaim";
import { handleSpecialChar } from "./handleSpecialChar";
import { modifySingleClaim } from "./modifySingleClaim";
import { getKeyInRange, isKeyInReserve } from "./otherUtils";
import { stringToUnicode } from "./stringToUnicode";
import { modifySingleClaimMatch } from "./modifySingleClaimMatch";
import { lookupDB, optimizeClaimMatch } from "./optimizeClaimMatch";

export const modifyAllClaims = async (
  data,
  whichOne,
  {
    descriptionOfElementMap,
    elementColorMap,
    allModeForInventionParagraphDetails,
    allClaimsDetails,
    utilityModelTitle,
    figureOfDrawingsMap,
    applicationNum,
    personalSettings,
    dbResultMap
  },
  oldClaimDetails,
  manuallyAddValues
) => {
  let claims = [];

  if (typeof whichOne === "number" && oldClaimDetails) {
    oldClaimDetails.forEach(({ content }, index) => {
      extractSingleClaim(index, claims, null, content);
    });
  } else if (typeof whichOne === "number" && oldClaimDetails === null) {
    data.children.forEach((claim, index) => {
      extractSingleClaim(index, claims, claim, "");
    });
  } else {
    whichOne.forEach(({ content: newContent, matches: newMatches }, index) => {
      if (newContent) {
        extractSingleClaim(index, claims, null, newContent);
      } else {
        extractSingleClaim(index, claims, null, oldClaimDetails[index].content);
        if (!newMatches) {
          claims[index].matches = null;
        } else if (newMatches && !newMatches.find((mt) => mt.preserveValue)) {
          // 有要 update 的 match 而且沒有要 preserveValue 的 match
          claims[index].matches = newMatches;
        } else {
          // 有要 update 的 match 而且有 preserveValue 的 match
          // 把 hasBeenModified = true 的保留，其他重新找
          claims[index].matches = null;
          claims[index].hasBeenModifiedMatches = newMatches
            .filter((nM) => nM.hasBeenModified)
            .filter((nM) => !nM.preserveValue);
          // console.log(claims[index].hasBeenModifiedMatches);
          // debugger;
        }
      }
    });
  }
  /*
     hasBeenModified: false, // 是否被 user 改過過
      preserveValue: false // 是不被　user 要求 preserveValue
  */

  let regExps = [];
  let regExpsOrigin = [];
  let concatRegExps = {};
  let regExp = ``;
  let concatRegExp = ``;
  let concatSymRegExp = ``;
  let regExpWithWrongChar = ``;
  let regExpBackup = ``;
  let regExpWithWrongCharbackup = ``;

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
      figureOfDrawingsMap[key].values.forEach((v) => {
        if (
          !allElements.find((allEl) => allEl.key === key && allEl.value === v)
        ) {
          allElements.push({
            key,
            value: v,
            from: "f"
          });
        }
      })
    );

  if (utilityModelTitle && utilityModelTitle !== "") {
    allElements.push({
      key: "utilityModelTitle",
      value: utilityModelTitle.replace(/[↵\n]/g, "").trim(),
      from: "t"
    });
  }

  if (manuallyAddValues.length > 0) {
    manuallyAddValues.forEach((manuallyAddValue) => {
      allElements.push({
        key: "manuallyAddValue",
        value: manuallyAddValue,
        from: "m"
      });
    });
  }

  allElements
    .sort((a, b) => b.value.length - a.value.length)
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
        }*/
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
        console.log(`claim RegExp goes wrong: ${regExps[0]}`);
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

  regExp = regExp.slice(0, regExp.length - 1);
  concatRegExp = concatRegExp.slice(0, concatRegExp.length - 1);
  concatSymRegExp = concatSymRegExp.slice(0, concatSymRegExp.length - 1);
  regExpWithWrongChar = regExpWithWrongChar.slice(
    0,
    regExpWithWrongChar.length - 1
  );

  // For Test
  // console.log([...regExpsOrigin.reverse()]);
  // console.log(regExpWithWrongChar);
  // debugger;
  // For Test

  // Find all matches in each claim
  let contentFirstIndexes = [];
  claims.forEach((claim, index) => {
    contentFirstIndexes.push(
      modifySingleClaimMatch(
        index,
        [...regExpsOrigin].reverse(),
        concatRegExp,
        concatSymRegExp,
        regExpWithWrongChar,
        claims,
        claim,
        descriptionOfElementMap,
        figureOfDrawingsMap,
        elementColorMap,
        allModeForInventionParagraphDetails,
        manuallyAddValues,
        utilityModelTitle,
        applicationNum
      )
    );
  });

  // look up db if
  // 1. useDatabase = true
  // 2. isInDescriptionOfElementMap = false
  // 3. shouldLookupDB = true
  await lookupDB(claims, personalSettings.useDatabase, dbResultMap);

  // optimize the match if
  // 1. isInDescriptionOfElementMap = false
  // 2. shouldLookupDB = false
  optimizeClaimMatch(claims);

  // Find illegal matches in each claim
  claims.forEach((claim, index) =>
    modifySingleClaim(
      index,
      [...regExpsOrigin].reverse(),
      concatRegExp,
      concatSymRegExp,
      claims,
      claim,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      elementColorMap,
      contentFirstIndexes[index]
    )
  ); // each claim

  // Find all usedElement in each claim
  claims.forEach((claim) => {
    // in case of preUsedElements is undefined
    if (!claim.preUsedElements) {
      claim.preUsedElements = [];
    }

    [...claim.matches.slice(1)]
      .sort((a, b) => b.value.length - a.value.length)
      .forEach(({ start, prevMatchedElement, value }) => {
        if (prevMatchedElement) {
          findAllUsedElements(claims, claim, prevMatchedElement, start, value);
        }
      });
  });

  claims.forEach((claim) => {
    claim.errors.sort((a, b) => a.start - b.start);
    claim.nonMatches.sort((a, b) => a.start - b.start);
    claim.usedElements.sort((a, b) => a.start - b.start);
    claim.preUsedElements.sort((a, b) => a.start - b.start);

    const rest = [
      ...claim.errors,
      ...claim.usedElements,
      ...claim.preUsedElements
    ].sort((a, b) => a.start - b.start);

    claim.matches = checkclaimSymbol(
      claim,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      claim.matches,
      "matches",
      rest
    );

    // Test
    // console.log(`claim ${claim.num} after checkclaimSymbol:matches`);

    claim.nonMatches = checkclaimSymbol(
      claim,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      claim.nonMatches,
      "nonMatches",
      rest
    );

    // Test
    // console.log(`claim ${claim.num} after checkclaimSymbol:nonMatches`);

    claim.usedElements = checkclaimSymbol(
      claim,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      claim.usedElements,
      "usedElements",
      rest
    );

    // Test
    // console.log(`claim ${claim.num} after checkclaimSymbol:usedElements`);

    claim.preUsedElements = checkclaimSymbol(
      claim,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      claim.preUsedElements,
      "preUsedElements",
      rest
    );

    claim.preUsedElementsNonUsed = claim.preUsedElements
      .filter(
        (plt) =>
          !claim.matches.some(
            (m) => !(plt.start >= m.end || plt.end <= m.start)
          )
      )
      .filter(
        (plt) =>
          !claim.usedElements.some(
            (m) => !(plt.start >= m.end || plt.end <= m.start)
          )
      );

    // Test
    // console.log(`claim ${claim.num} after checkclaimSymbol:preUsedElements`);
    if (
      claim.type === "independent" &&
      applicationNum &&
      applicationNum[3] !== "1"
    ) {
      checkClaimConnection(claim);
    }

    let modifiedClaim = claim.content;

    modifiedClaim = highlightClaimContent(
      claim,
      modifiedClaim,
      elementColorMap,
      applicationNum
    );

    // Test
    // console.log(`claim ${claim.num} after highlightClaimContent`);

    claim.modifiedClaim = modifiedClaim;
    claim.isCollapse = true;
    // claim.errors = claim.errors.sort((a, b) => a.start - b.start);
    // claim.nonMatches = claim.nonMatches.sort((a, b) => a.start - b.start);
    allClaimsDetails.push(claim);
  }); // Each claim
};

function checkclaimSymbol(
  claim,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  matches,
  type,
  rest
) {
  // keyStartMatch(claim.content.slice())
  return matches.map((match) => {
    if (
      match.hasOuterKey &&
      match.keys &&
      match.keys.length === 1 &&
      match.keys[0] !== ""
    ) {
      // 第一、第二元件 的情況，已經知道 keys 了
      const key = match.keys[0];
      // const values = descriptionOfElementMap[key]
      //   ? descriptionOfElementMap[key].values.filter((v) => v !== "")
      //   : null;
      const values = getValues(
        key,
        descriptionOfElementMap,
        figureOfDrawingsMap
      );
      let wrongKeys = [];
      if (
        (values.length === 0 ||
          !values.some((v) => v.endsWith(match.fullValue || match.value))) &&
        !isKeyInReserve(key)
      ) {
        wrongKeys.push(key);
        if (type !== "nonMatches") {
          const errorData = {
            message: `「${match.value}（${key}）」的元件名稱或符號錯誤`,
            start: match.start,
            end: match.end,
            name: match.fullValue || match.value,
            wrongKeys: [key]
          };
          if (
            !claim.errors.find(
              (err) =>
                err.name === errorData.name &&
                err.start === errorData.start &&
                err.end === errorData.end
            )
          ) {
            claim.errors.push(errorData);
          } else {
            const idxOfErr = claim.errors.findIndex(
              (err) =>
                err.name === errorData.name &&
                err.start === errorData.start &&
                err.end === errorData.end
            );
            if (!claim.errors[idxOfErr].wrongKeys.includes(key)) {
              const newWrongKeys = [...claim.errors[idxOfErr].wrongKeys, key];
              claim.errors[idxOfErr] = {
                ...claim.errors[idxOfErr],
                message: `「${match.value}（${newWrongKeys.join(
                  "）、（"
                )}）」的元件名稱或符號錯誤`,
                wrongKeys: newWrongKeys
              };
            }
          }
        }
      }
      match.wrongKeys = wrongKeys;
      // match.hasOuterKey = true;
      // Test
      // console.log(match);
      // debugger;
      return match;
    }

    let keyMatch = keyStartMatch(claim.content.slice(match.end));
    if (!keyMatch) {
      match.keys = null;
      match.wrongKeys = null;
      // match.end = match.start + (match.value || match.item || "").length;
      return match;
    }

    // Test

    if (
      keyMatch[0] &&
      RegExp(`[${allSymbolChar}']+$`, "i").test(keyMatch[0]) &&
      /^[@θ%度˚℃]/.test(claim.content.slice(match.end + keyMatch[0].length))
    ) {
      keyMatch[0] = keyMatch[0].split(/[、,]/).slice(0, -1).join("、");
    }

    // Test
    // if (claim.num === 4) {
    //   console.log(keyMatch);
    //   debugger;
    // }

    const nextRest = rest.find((mm) => mm.start > match.end);
    const newEnd = match.end + keyMatch[0].length;
    if (nextRest && nextRest.start <= newEnd) {
      match.keys = null;
      match.wrongKeys = null;
      // match.end = match.start + (match.value || match.item || "").length;
      return match;
    }

    // Test
    // console.log(
    //   "claim item key match: ",
    //   keyMatch[0],
    //   " value: ",
    //   match.fullValue || match.value,
    //   " origin match: ",
    //   match
    // );

    let keys = keyMatch[0]
      .replaceAll(/[()]/g, "")
      .split(/[、,]/)
      .filter((e) => e !== "");
    // if (/.+[~-].+/.test(keys[0])) {
    //   keys = getKeyInRange(keys[0]);
    // }

    if (keys.some((curKey) => /.+[-~～].+/.test(curKey))) {
      keys = keys.reduce((accKeys, curKey) => {
        if (/.+[-~～].+/.test(curKey)) {
          return [...accKeys, ...getKeyInRange(curKey)];
        }
        return [...accKeys, curKey];
      }, []);
      // keys = getKeyInRange(keys[0]);
    }

    // Test
    // if (match.value === "蓋" && match.item === "蓋") {
    //   console.log(match);
    //   console.log(keys);
    //   console.log("values")
    //   debugger;
    // }
    keys = keys.filter((k) => !isKeyInReserve(k) && isKeyValid(k));
    if (keys.length === 0) {
      match.keys = null;
      match.wrongKeys = null;
      // match.end = match.start + (match.value || match.item || "").length;
      return match;
    }
    keys = Array.from(new Set(keys));

    if (!/[()]/.test(keyMatch[0]) && keys.length > 0) {
      const errorData = {
        message: `「${match.fullValue || match.value}${
          keyMatch[0]
        }」的符號未置於括號內`,
        start: match.start,
        end: match.end
      };
      if (!claim.errors.find((err) => err.start === errorData.start)) {
        claim.errors.push(errorData);
      }
    }

    let wrongKeys = [];
    keys.forEach((k) => {
      // const values = descriptionOfElementMap[k]
      //   ? descriptionOfElementMap[k].values.filter((v) => v !== "")
      //   : null;
      const values = getValues(k, descriptionOfElementMap, figureOfDrawingsMap);
      if (
        values.length === 0 &&
        !isValueExisted(
          match.value,
          descriptionOfElementMap,
          figureOfDrawingsMap
        )
      ) {
        return;
      } else if (
        values.length === 0 ||
        !values.some((v) => v.endsWith(match.value))
      ) {
        wrongKeys.push(k);
        if (type !== "nonMatches") {
          // Test
          // console.log(match);
          // debugger;

          const errorData = {
            message: `「${match.value}（${k}）」的元件名稱或符號錯誤`,
            start: match.start,
            end: match.end,
            name: match.fullValue || match.value,
            wrongKeys: [k]
          };
          if (
            !claim.errors.find(
              (err) =>
                err.name === errorData.name &&
                err.start === errorData.start &&
                err.end === errorData.end
            )
          ) {
            claim.errors.push(errorData);
          } else {
            const idxOfErr = claim.errors.findIndex(
              (err) =>
                err.name === errorData.name &&
                err.start === errorData.start &&
                err.end === errorData.end
            );
            if (!claim.errors[idxOfErr].wrongKeys.includes(k)) {
              const newWrongKeys = [...claim.errors[idxOfErr].wrongKeys, k];
              claim.errors[idxOfErr] = {
                ...claim.errors[idxOfErr],
                message: `「${
                  match.fullValue || match.value
                }（${newWrongKeys.join("）、（")}）」的元件名稱或符號錯誤`,
                wrongKeys: newWrongKeys
              };
            }
          }
        }
      }
    });

    match.keys = keys;
    match.wrongKeys = wrongKeys;
    match.end = newEnd;

    // Test
    // if (wrongKeys.length > 0) {
    //   console.log(match);
    //   debugger;
    // }

    return match;
  }); // for each match
}

export function highlightClaimContent(
  claim,
  modifiedClaim,
  elementColorMap,
  applicationNum
) {
  if (claim.type === "unknown") {
    return `<span>${modifiedClaim}</span>`;
  }

  // const preUsedElementsNonUsed = claim.preUsedElements
  //   .filter(
  //     (plt) =>
  //       !claim.matches.some((m) => !(plt.start >= m.end || plt.end <= m.start))
  //   )
  //   .filter(
  //     (plt) =>
  //       !claim.usedElements.some(
  //         (m) => !(plt.start >= m.end || plt.end <= m.start)
  //       )
  //   );

  const highlightBlocks = [];

  // if (claim.num === 1) {
  //   console.log(
  //     [
  //       ...claim.matches,
  //       ...claim.usedElements,
  //       ...claim.preUsedElementsNonUsed,
  //       ...claim.errors
  //     ]
  //       .sort((a, b) => b.start - a.start)
  //       .filter((abc) => abc.start === null)
  //   );
  //   debugger;
  // }

  [
    ...claim.matches,
    ...claim.usedElements,
    ...claim.preUsedElementsNonUsed,
    ...claim.errors
  ]
    .sort((a, b) => b.start - a.start)
    .forEach(
      ({
        message,
        errorContent,
        type,
        group,
        value,
        fullValue,
        item,
        start,
        realStart,
        end,
        isOK,
        keyEnd,
        keyStart,
        keyBeenModified,
        hasOuterKey,
        wrongKeys,
        isMainElement,
        indexOfMatch,
        hasBeenModified,
        isMainComp
      }) => {
        if (message) {
          highlightBlocks.push({
            start,
            end,
            endTag: "",
            startTag: "",
            message,
            errorContent
          });
        } else if (type === "usedElement") {
          const startTag = `<span class="usedElement u-${group} ${
            claim.errors.find(
              (err) =>
                err.start === start && /的符號未置於括號內/.test(err.message)
            ) ||
            (wrongKeys && wrongKeys.length > 0)
              ? "claim-wrongkey-border"
              : ""
          }" ${
            claim.type === "independent" && isMainComp
              ? `data-for='claim-${claim.num}-prematch-tooltip' data-tip='yes'`
              : ""
          }>${isMainComp ? "<small class='m'>M</small>" : ""}`;
          highlightBlocks.push({
            start,
            end,
            endTag: `</span>`,
            startTag
          });
          if (hasOuterKey && !keyBeenModified) {
            highlightBlocks.push({
              start: keyStart,
              end: keyEnd,
              endTag: `</span>`,
              startTag
            });
          }
        } else if (type === "preUsedElements") {
          const startTag = `<span style="color: ${
            elementColorMap[group] ? elementColorMap[group].color : "black"
          }; font-weight: 700;
            background: transparent;
            border: ${
              claim.errors.find(
                (err) =>
                  err.start === start && /的符號未置於括號內/.test(err.message)
              ) ||
              (wrongKeys && wrongKeys.length > 0)
                ? "3px solid red"
                : "none"
            };
            text-shadow: 1px 1px 1px rgb(0, 0, 0, .7);" ${
              claim.type === "independent"
                ? `data-for='claim-${claim.num}-prematch-tooltip' data-tip='${
                    isMainComp ? "yes" : "no"
                  }'`
                : ""
            }>${isMainComp ? "<small class='m'>M</small>" : ""}`;
          highlightBlocks.push({
            start,
            end,
            endTag: `</span>`,
            startTag
          });
          if (hasOuterKey && !keyBeenModified) {
            highlightBlocks.push({
              start: keyStart,
              end: keyEnd,
              endTag: `</span>`,
              startTag
            });
          }
        } else {
          const startTag = `<span class="${
            isMainElement ? "mainElement" : ""
          } ${isOK ? "mainElementOK" : "mainElementNotOK"} ${
            hasBeenModified ? "m" : isOK ? "c" : "e"
          }-${group} ${
            claim.errors.find(
              (err) =>
                err.start === start && /的符號未置於括號內/.test(err.message)
            ) ||
            (wrongKeys && wrongKeys.length > 0)
              ? "claim-wrongkey-border"
              : ""
          }"
            data-elvalue=${value}
            data-elfullvalue=${fullValue ? fullValue : "none"}
            data-elitem=${item}
            data-start=${start}
            data-end=${end}
            data-realstart=${realStart ? realStart : -1}
            data-indexofmatch=${indexOfMatch}
            data-for='claim-${
              claim.num
            }-prematch-tooltip' data-tip=${indexOfMatch}
          >`;
          highlightBlocks.push({
            start,
            end,
            endTag: `</span>`,
            startTag,
            isMainElement
          });
          if (hasOuterKey && !keyBeenModified) {
            highlightBlocks.push({
              start: keyStart,
              end: keyEnd,
              endTag: `</span>`,
              startTag,
              isMainElement
            });
          }
        }
      }
    );

  // Test
  // if (claim.num === 1) {
  //   console.log([...highlightBlocks].sort((a, b) => b.start - a.start));
  //   debugger;
  // }

  highlightBlocks
    .sort((a, b) => b.start - a.start)
    .forEach((highlight) => {
      if (highlight.message) {
        if (/請求項未以單句為之\(句號在句中\)/.test(highlight.message)) {
          modifiedClaim =
            modifiedClaim.slice(0, highlight.start) +
            "<span class='err-span'>。</span>" +
            modifiedClaim.slice(highlight.end);
        } else if (
          /未以選擇式為之$/.test(highlight.message) ||
          /^附屬項文字開頭/.test(highlight.message) ||
          /^獨立項之引用記載形式/.test(highlight.message)
        ) {
          modifiedClaim = modifiedClaim.replace(
            highlight.errorContent,
            `<span class='err-span'>${highlight.errorContent}</span>`
          );
        } /*else if (
          /係為(方法|結構)，不符新型標的之規定/.test(highlight.message)
        ) {
          modifiedClaim = modifiedClaim.replace(
            highlight.errorContent,
            `<span class='err-span'>${highlight.errorContent}</span>`
          );
        } else if (
          highlight.message &&
          highlight.errorContent
        ) {
          // console.log(claim.num);
          // console.log(highlight.message);
          // console.log(highlight.errorContent);
          // debugger;
          modifiedClaim = modifiedClaim.replace(
            highlight.errorContent,
            `<span class='err-span'>${highlight.errorContent}</span>`
          );
        }*/
      } else {
        modifiedClaim = [
          modifiedClaim.slice(0, highlight.end),
          highlight.endTag,
          modifiedClaim.slice(highlight.end)
        ].join("");

        // Test
        if (
          applicationNum &&
          applicationNum[3] !== "1" &&
          claim.type === "independent" &&
          highlight.isMainElement &&
          modifiedClaim
            .slice(highlight.start, highlight.end)
            .match(/(方法|程序|流程|步驟)$/)
        ) {
          let mainEl = modifiedClaim.slice(highlight.start, highlight.end);
          const mainElMatch = mainEl.match(/(方法|程序|流程|步驟)$/);
          mainEl =
            mainEl.slice(0, mainElMatch.index) +
            `<span class='err-span' style="padding-inline: 4px; margin-right: -4px;">${mainElMatch[0]}</span>`;

          // console.log(modifiedClaim.slice(highlight.start, highlight.end));
          // console.log(mainEl);
          // debugger;
          modifiedClaim = [
            modifiedClaim.slice(0, highlight.start),
            mainEl,
            modifiedClaim.slice(highlight.end)
          ].join("");
        }

        modifiedClaim = [
          modifiedClaim.slice(0, highlight.start),
          highlight.startTag,
          modifiedClaim.slice(highlight.start)
        ].join("");
      }
    });

  return modifiedClaim;
}

function findAllUsedElements(claims, claim, prevItem, start, value) {
  let searchClaimsNum = [claim.num, ...claim.matchedClaimsNum];
  let currentClaimNum;
  let values = Array.from(
    new Set([prevItem.fullValue, prevItem.value, value])
  ).filter((a) => !!a);
  const valueReg = new RegExp(`(${values.join("|")})`, "g");
  /* let wantedValue = prevItem.fullValue
    ? `${prevItem.fullValue}|${prevItem.value}`
    : prevItem.value; */
  // const valueReg = new RegExp(wantedValue, "g");
  do {
    currentClaimNum = searchClaimsNum.shift();
    const claimContent =
      currentClaimNum === claim.num
        ? claims[currentClaimNum - 1].content.slice(0, start)
        : claims[currentClaimNum - 1].content;

    // Test
    // console.log("currentClaimNum: ", currentClaimNum);
    // console.log(
    //   "claims[currentClaimNum - 1].preUsedElements: ",
    //   claims[currentClaimNum - 1].preUsedElements
    // );

    let allUsedElements = [...claimContent.matchAll(valueReg)];
    allUsedElements = allUsedElements
      .filter(
        (plt) =>
          !claims[currentClaimNum - 1].matches.some(
            (m) => !(plt.index >= m.end || plt.index + plt[0].length <= m.start)
          )
      )
      .filter(
        (plt) =>
          !claims[currentClaimNum - 1].preUsedElements
            // .filter((pUsed) => !values.find((ee) => pUsed.value.endsWith(ee)))
            .filter((pUsed) => !values.find((ee) => pUsed.value === ee))
            .some(
              (m) =>
                !(plt.index >= m.end || plt.index + plt[0].length <= m.start)
            )
      )
      .filter(
        (plt) =>
          !claims[currentClaimNum - 1].usedElements.some(
            (m) => !(plt.index >= m.end || plt.index + plt[0].length <= m.start)
          )
      );
    allUsedElements.forEach((mm) => {
      claims[currentClaimNum - 1].usedElements.push({
        end: mm.index + mm[0].length,
        group: prevItem.group,
        item: prevItem.item,
        start: mm.index,
        type: "usedElement",
        value: mm[0],
        claimNum: currentClaimNum
      });
    });
  } while (searchClaimsNum.length > 0);
}

function getValues(key, descriptionOfElementMap, figureOfDrawingsMap) {
  const values = [
    ...((descriptionOfElementMap[key] &&
      descriptionOfElementMap[key].values.filter((v) => v !== "")) ||
      []),
    ...((figureOfDrawingsMap[key] &&
      figureOfDrawingsMap[key].values.filter((v) => v !== "")) ||
      [])
  ];

  Object.keys(descriptionOfElementMap)
    .filter((k) => k.startsWith(`${key}_duplicate`))
    .forEach((k) => values.push(...descriptionOfElementMap[k].values));

  return values;
}

function isValueExisted(value, descriptionOfElementMap, figureOfDrawingsMap) {
  return [
    ...Object.values(descriptionOfElementMap),
    ...Object.values(figureOfDrawingsMap)
  ]
    .map((v) => v.values)
    .flat()
    .find((v) => v === value);
}
