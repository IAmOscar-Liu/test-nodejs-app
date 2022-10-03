import { allIgnoreMiddleWords } from "../dict/allIgnoreMiddleWords";
import {
  getLimitedChar,
  getReferWords_1,
  getReferWords_2,
  symetricPrefix
} from "../dict/allReferWords";
import { concatWordSeparater } from "../dict/concatWordSeparater";
import { pickColor } from "../dict/elementColors";
import { allSymbolChar, isKeyValid } from "../dict/keyRegs";
import { getKeyInRange, getMapValues, isKeyInReserve } from "./otherUtils";
import { stringToUnicode } from "./stringToUnicode";

export const checkIllegalAttach = (
  regExpsOrigin,
  concatRegExp,
  concatSymRegExp,
  contentFirstIndex,
  claims,
  claim,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  elementColorMap,
  searchPath,
  isFirstPath,
  isValueFixed,
  isTestMode
) => {
  // Test
  // if (claim.num === 1) {
  //   console.log(claim.matches);
  //   debugger;
  // }

  // 先處理請求項的元件有在符號說明的內容
  if (isFirstPath /*&& round === 1*/) {
    findAllPreUsedElements(
      claim,
      contentFirstIndex,
      regExpsOrigin,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      concatRegExp,
      concatSymRegExp
    );
  }

  if (!claim.matches[0]) return;

  // 1. 檢查請求項中在符號說明的「該」元件
  [
    claim.matches[0],
    ...claim.matches
      .slice(1)
      .filter((mm) => mm.isInDescriptionOfElementMap)
      .sort((a, b) => b.item.length - a.item.length)
  ].forEach(
    (
      {
        group,
        value,
        fullValue,
        item,
        start,
        end,
        pathIsOK,
        isInDescriptionOfElementMap,
        indexOfMatch,
        keys,
        keyEnd,
        keyStart,
        keyBeenModified
      },
      matchNum
    ) => {
      // Test
      // if (
      //   claim.num === 1 &&
      //   round === 2 &&
      //   //searchPath.length === 1 &&
      //   //searchPath[0] === 1 &&
      //   value === "宮廟單元"
      // ) {
      //   console.log("round 2");
      //   // console.log("isFirstPath: ", isFirstPath);
      //   // console.log("isTestMode:", isTestMode);
      //   console.log("start: ", start);
      //   console.log("value: ", value);
      //   console.log("pathIsOK: ", pathIsOK);
      //   debugger;
      // }
      // Test
      // if (claim.num === 5) {
      //   console.log("check here");
      //   // console.log("isFirstPath: ", isFirstPath);
      //   // console.log("isTestMode:", isTestMode);
      //   console.log(
      //     "value: ",
      //     value,
      //     "matchNum:",
      //     matchNum,
      //     "pathIsOK: ",
      //     pathIsOK
      //   );
      // }
      // Test
      // if (
      //   claim.num === 1 &&
      //   //searchPath.length === 1 &&
      //   //searchPath[0] === 1 &&
      //   value === "宮廟單元"
      // ) {
      //   console.log("check all");
      //   // console.log("isFirstPath: ", isFirstPath);
      //   // console.log("isTestMode:", isTestMode);
      //   console.log("value: ", value);
      //   console.log("start: ", start);
      //   debugger;
      // }
      // Test
      // if (claim.num === 1 && start === 66) {
      //   console.log("claim 1 start 66 match");
      //   console.log(claim.matches[1]);
      //   debugger;
      // }

      if (matchNum === 0 && claim.type === "independent") {
        claim.matches[0] = {
          ...claim.matches[0],
          keyFromGroup: getElementKeyByGroup(
            claim.matches[0].group,
            descriptionOfElementMap
          )
        };
      } else if (matchNum === 0 && claim.type === "additional") {
        // 檢查主要元件名稱是否興所依附請求項的主要元件名稱用語不一致
        if (
          !(claims[searchPath[0] - 1] && claims[searchPath[0] - 1].mainElement)
        ) {
          return;
        } else if (
          RegExp(`${claim.mainElement.split(/[\\(\\)]/)[0]}$`).test(
            claims[searchPath[0] - 1].mainElement.split(/[\\(\\)]/)[0]
          )
        ) {
          const prevMatchedElement = {
            ...claims[searchPath[0] - 1].matches[0],
            claimNum: searchPath[0],
            isMainElement: true
          };

          claim.matches[0] = {
            ...claim.matches[0],
            group: prevMatchedElement.group,
            keyFromGroup: getElementKeyByGroup(
              prevMatchedElement.group,
              descriptionOfElementMap
            ),
            item: prevMatchedElement.item,
            pathIsOK: true,
            prevMatchedElement
          };
        } else if (!isTestMode) {
          const message = `本請求項標的名稱「${
            claim.mainElement
          }」與所依附之請求項(${searchPath[0]})之標的名稱「${
            claims[searchPath[0] - 1].mainElement
          }」用語不一致`;
          claim.errors.unshift({
            message,
            start,
            end
          });
          if (
            !claim.nonMatches.find(
              (mm) =>
                mm.group === group && mm.start === start && mm.item === item
            )
          ) {
            claim.nonMatches.push({
              group,
              keyFromGroup: getElementKeyByGroup(
                group,
                descriptionOfElementMap
              ),
              item,
              start,
              end,
              paths: [searchPath]
            });
          } else {
            claim.nonMatches[
              claim.nonMatches.findIndex(
                (mm) =>
                  mm.group === group && mm.start === start && mm.item === item
              )
            ].paths.push(searchPath);
          }
        }
      } else if (matchNum > 0 && !pathIsOK) {
        // 檢查其他元件各稱是不有不當依附
        //「該」元件在符號說明之中

        // Test
        // if (claim.num === 9 && value === "警示單元") {
        //   console.log("start: ", start);
        //   console.log("value: ", value);
        //   console.log("pathIsOK: ", pathIsOK);
        //   debugger;
        // }

        if (
          // 2-1. 若不是，再檢查該元件是否已被記錄下來
          [
            claim.usedElements,
            ...searchPath.map((n) => claims[n - 1].usedElements)
          ]
            .flat()
            .some(
              (el) =>
                RegExp(`${fullValue || value}$`).test(
                  el.fullValue || el.value
                ) && el.group === group
            )
        ) {
          // Test
          // if (
          //   claim.num === 9 &&
          //   //searchPath.length === 1 &&
          //   //searchPath[0] === 1 &&
          //   value === "警示單元"
          // ) {
          //   console.log("check here 2");
          //   // console.log("isFirstPath: ", isFirstPath);
          //   // console.log("isTestMode:", isTestMode);
          //   console.log("value: ", value);
          //   console.log("start: ", start);
          //   debugger;
          // }

          const prevItem = [
            claim.usedElements,
            ...searchPath.map((n) => claims[n - 1].usedElements)
          ]
            .flat()
            .find(
              (el) =>
                RegExp(`${fullValue || value}$`).test(
                  el.fullValue || el.value
                ) && el.group === group
            );

          claim.matches = claim.matches.map((mm) => {
            if (mm.indexOfMatch === indexOfMatch) {
              return {
                ...mm,
                keyFromGroup: getElementKeyByGroup(
                  mm.group,
                  descriptionOfElementMap
                ),
                pathIsOK: true,
                prevMatchedElement: {
                  ...prevItem,
                  type: "usedElement"
                  // group: prevItem.group,
                  // start: prevItem.start,
                  // value: prevItem.value,
                  // item: prevItem.item,
                  // end: prevItem.end,
                  // claimNum: prevItem.claimNum
                }
              };
            }
            return mm;
          });
        } else if (
          // 2-2. 如果該元件是縮寫, e.g. 第一, 去找是不是有 「第一元件」
          [
            claim.preUsedShortElements.filter((el) => el.end < start),
            ...searchPath.map((n) => claims[n - 1].preUsedShortElements)
          ]
            .flat()
            .some((el) => RegExp(`${fullValue || value}$`).test(el.fullValue))
        ) {
          const prevItem = [
            claim.preUsedShortElements.filter((el) => el.end < start),
            ...searchPath.map((n) => claims[n - 1].preUsedShortElements)
          ]
            .flat()
            .find((el) => RegExp(`${fullValue || value}$`).test(el.fullValue));

          /*
            const prevMatchedElement = {
              type: "usedElement",
              group,
              item,
              value: prevItem[0].slice(prevItem[1].length),
              start: mStart,
              end: mEnd,
              claimNum: currentClaimNum
            };
            claimNum: 1
            end: 73
            fullValue: "第一側壁部"
            group: "7b2c4e00507458c190e8"
            key: null
            keyEnd: null
            keyStart: null
            start: 71
            type: "preUsedElements"
            value: "第一"
          */
          const prevMatchedElement = {
            ...prevItem,
            type: "usedElement"
            // item
            // group: prevItem.group,
            // value: prevItem.value,
            // fullValue: prevItem.fullValue,
            // start: prevItem.start,
            // end: prevItem.end,
            // claimNum: prevItem.claimNum
          };

          if (!isTestMode) {
            claim.usedElements.push(prevMatchedElement);
          }

          claim.matches = claim.matches.map((mm) => {
            if (mm.indexOfMatch === indexOfMatch) {
              return {
                ...mm,
                group: prevMatchedElement.group,
                keyFromGroup: getElementKeyByGroup(
                  prevMatchedElement.group,
                  descriptionOfElementMap
                ),
                item: prevMatchedElement.item,
                pathIsOK: true,
                prevMatchedElement
              };
            }
            return mm;
          });
        } else {
          // 3. 最後，從前面的請求項內容中找是否有出現過
          //// Test
          // if (
          //   claim.num === 9 &&
          //   //searchPath.length === 1 &&
          //   //searchPath[0] === 1 &&
          //   value === "警示單元"
          // ) {
          //   console.log("check here 3");
          //   // console.log("isFirstPath: ", isFirstPath);
          //   // console.log("isTestMode:", isTestMode);
          //   console.log("value: ", value);
          //   console.log("start: ", start);
          //   debugger;
          // }
          let prevItem;
          let searchClaimsNum = [claim.num, ...searchPath];
          let currentClaimNum;
          do {
            currentClaimNum = searchClaimsNum.shift();
            const claimContent =
              currentClaimNum === claim.num
                ? claims[currentClaimNum - 1].content.slice(0, start)
                : claims[currentClaimNum - 1].content;
            // 找到該請求項第一個 Match 的且不可與「該」元件名稱重疊

            prevItem = [
              /*[
                ...claimContent.matchAll(
                  RegExp(
                    `(${getReferWords_1()})[^${getLimitedChar()}]{1,8}?${
                      fullValue || value
                    }`,
                    "g"
                  )
                )
              ].map((mp) => {
                mp.newIndex = mp.index + 10000;
                return mp;
              }),*/
              [
                ...claimContent.matchAll(
                  RegExp(`(${getReferWords_1()})${fullValue || value}`, "g")
                )
              ].map((mp) => {
                mp.newIndex = mp.index + 10000;
                return mp;
              }),
              /*[
                ...claimContent.matchAll(
                  RegExp(
                    `(${getReferWords_2()})[^${getLimitedChar()}]{1,8}?${
                      fullValue || value
                    }`,
                    "g"
                  )
                )
              ].map((mp) => {
                mp.newIndex = mp.index + 20000;
                return mp;
              }),*/
              [
                ...claimContent.matchAll(
                  RegExp(`(${getReferWords_2()})${fullValue || value}`, "g")
                )
              ].map((mp) => {
                mp.newIndex = mp.index + 20000;
                return mp;
              }),
              [
                ...claimContent.matchAll(RegExp(`()${fullValue || value}`, "g"))
              ].map((mp) => {
                mp.newIndex = mp.index + 30000;
                return mp;
              })
            ]
              .flat()
              .filter(
                (o) =>
                  // !/(前述之|所述之|上述之|係用以|係用來|係用於|若干個|若干種|複數個|複數種|多數個|多數種|若干|一個|一種|二個|二種|複數|前述|所述|上述|其中|多個|多種|多數|具有|包含|包括|多|二|一|個|種|些|和|及|與|或|之|的|係|該|@|、|，|、|，|-|；|:|,|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」)/.test(
                  !RegExp(allIgnoreMiddleWords()).test(
                    o[0]
                      .slice(o[1].length, o[0].length - value.length)
                      .replace(/^第./, "")
                  )
              )
              .filter(
                (o) =>
                  !RegExp(`[^\\u4E00-\\u9FFF${allSymbolChar}]`, "i").test(
                    o[0]
                      .slice(o[1].length, o[0].length - value.length)
                      .replace(/^第./, "")
                  )
              )
              .sort(
                (a, b) =>
                  b[0].slice(b[1].length).length -
                    a[0].slice(a[1].length).length || a.newIndex - b.newIndex
              )
              .filter((plt) => {
                const matchedStr = plt[0].slice(plt[1].length);
                const extraPreStr = matchedStr.slice(
                  0,
                  matchedStr.lastIndexOf(fullValue || value)
                );
                if (extraPreStr === "") return true;
                return !regExpsOrigin
                  .map((og) => og.value)
                  .find((v) => extraPreStr.includes(v));
              })
              .filter(
                (plt) =>
                  !claims[currentClaimNum - 1].matches.some(
                    (m) =>
                      !(
                        plt.index + plt[1].length >= m.end ||
                        plt.index + plt[0].length <= m.start
                      )
                  )
              )
              .filter(
                (plt) =>
                  !claims[currentClaimNum - 1].preUsedElements
                    .filter(
                      // 不一樣的留下來，不一樣的才不會碰撞
                      // (pUsed) => pUsed.value !== plt[0].slice(plt[1].length)
                      (pUsed) => {
                        // 一樣的 return false, 不一樣的 return true
                        // pUsed.value == 側牆板 和  "第一側牆板" 一樣

                        /*
                        if (
                          plt[0].slice(plt[1].length) === "第一側牆板" &&
                          pUsed.value === "側牆板"
                        ) {
                          console.log(plt[0].slice(plt[1].length));
                          console.log(
                            plt[0].slice(plt[1].length).length > pUsed.value.length
                          );
                          console.log(
                            RegExp(
                              `^(第[一二三四五六七八九十]|${symetricPrefix()
                                .split("")
                                .join("|")})(${pUsed.value})$`
                            )
                          );
                          console.log(
                            plt[0].slice(plt[1].length).length > pUsed.value.length &&
                              RegExp(
                                `^(第[一二三四五六七八九十]|${symetricPrefix()
                                  .split("")
                                  .join("|")})(${pUsed.value})$`
                              ).test(plt[0].slice(plt[1].length))
                          );
                          debugger;
                        }
                        */

                        if (
                          plt[0].slice(plt[1].length).length >
                            pUsed.value.length &&
                          RegExp(
                            `^(第[一二三四五六七八九十]|${symetricPrefix()
                              .split("")
                              .join("|")})(${pUsed.value})$`
                          ).test(plt[0].slice(plt[1].length))
                        )
                          return false;

                        return (
                          !pUsed.value.endsWith(plt[0].slice(plt[1].length)) &&
                          pUsed.group !== group
                        );
                      }
                    )
                    .some(
                      (m) =>
                        !(
                          plt.index + plt[1].length >= m.end ||
                          plt.index + plt[0].length <= m.start
                        )
                    )
              )
              .find(
                (plt) =>
                  !claims[currentClaimNum - 1].usedElements.some(
                    (m) =>
                      !(
                        plt.index + plt[1].length >= m.end ||
                        plt.index + plt[0].length <= m.start
                      )
                  )
              );
          } while (!prevItem && searchClaimsNum.length > 0);
          if (!prevItem) {
            // 前面沒有該元件
            // Test
            // if (
            //   claim.num === 9 &&
            //   //searchPath.length === 1 &&
            //   //searchPath[0] === 1 &&
            //   value === "警示單元"
            // ) {
            //   console.log("not found");
            //   // console.log("isFirstPath: ", isFirstPath);
            //   // console.log("isTestMode:", isTestMode);
            //   console.log("start: ", start);
            //   console.log("value: ", value);
            //   console.log("pathIsOK: ", pathIsOK);
            //   debugger;
            // }

            // 1. 先檢查是否與主要元件名稱相符
            if (
              [
                claim.mainElement,
                ...searchPath.map((n) => claims[n - 1].mainElement)
              ]
                // .map((mainElement) => mainElement.split(/[^\u4E00-\u9FFF]/)[0])
                .map((mainElement) => mainElement.split(/[\\(\\)]/)[0])
                .map((mainElement) =>
                  mainElement.split(/[之的]/).length > 1
                    ? [mainElement, ...mainElement.split(/[之的]/)]
                    : [mainElement]
                )
                .flat()
                .some((el) => RegExp(`${fullValue || value}$`).test(el))
            ) {
              // Test
              // if (
              //   claim.num === 1 &&
              //   //searchPath.length === 1 &&
              //   //searchPath[0] === 1 &&
              //   value === "宮廟單元"
              // ) {
              //   console.log("check here 2");
              //   // console.log("isFirstPath: ", isFirstPath);
              //   // console.log("isTestMode:", isTestMode);
              //   console.log("value: ", value);
              //   console.log("start: ", start);
              //   debugger;
              // }
              const foundEl = [
                { mainElement: claim.mainElement, num: claim.num },
                ...searchPath.map((n) => ({
                  mainElement: claims[n - 1].mainElement,
                  num: claims[n - 1].num
                }))
              ]
                .map((mel) => ({
                  ...mel,
                  // mainElement: mel.mainElement.split(/[^\u4E00-\u9FFF]/)[0]
                  mainElement: mel.mainElement.split(/[\\(\\)]/)[0]
                }))
                .map(({ mainElement, num }) =>
                  mainElement.split(/[之的]/).length > 1
                    ? [
                        { mainElement, num },
                        ...mainElement
                          .split(/[之的]/)
                          .map((mel) => ({ mainElement: mel, num }))
                      ]
                    : [{ mainElement, num }]
                )
                .flat()
                .find((el) =>
                  RegExp(`(${fullValue || value})$`).test(el.mainElement)
                );

              const { num: wantedClaimNum } = foundEl;

              // console.log("wantedClaimNum", wantedClaimNum);
              // console.log(
              //   "match mainElement: ",
              //   claims[wantedClaimNum - 1].mainElement
              // );
              // debugger;

              claim.matches = claim.matches.map((mm, matchIndex) => {
                if (mm.indexOfMatch === indexOfMatch) {
                  const prevMatchedElement =
                    claims[wantedClaimNum - 1].matches[0];

                  return {
                    ...mm,
                    pathIsOK: true,
                    // item: claims[wantedClaimNum - 1].mainElement,
                    // group: stringToUnicode(claims[wantedClaimNum - 1].mainElement),
                    item: prevMatchedElement.item,
                    group: prevMatchedElement.group,
                    keyFromGroup: getElementKeyByGroup(
                      prevMatchedElement.group,
                      descriptionOfElementMap
                    ),
                    prevMatchedElement: {
                      ...prevMatchedElement,
                      type: "usedElement",
                      // group: stringToUnicode(
                      //   claims[wantedClaimNum - 1].mainElement
                      // ),
                      // value: claims[wantedClaimNum - 1].mainElement,
                      // item: claims[wantedClaimNum - 1].mainElement,
                      // start: claims[wantedClaimNum - 1].content.indexOf(
                      //   claims[wantedClaimNum - 1].mainElement
                      // ),
                      // end:
                      //   claims[wantedClaimNum - 1].content.indexOf(
                      //     claims[wantedClaimNum - 1].mainElement
                      //   ) + claims[wantedClaimNum - 1].mainElement.length,
                      claimNum: wantedClaimNum,
                      isMainElement: true
                    }
                  };
                }
                return mm;
              });
              return;
            }

            // 若仍然找不到，回去找 usedElement, 但這次允許 group 不一樣
            if (
              [
                claim.usedElements,
                ...searchPath.map((n) => claims[n - 1].usedElements)
              ]
                .flat()
                .some((el) =>
                  RegExp(`${fullValue || value}$`).test(
                    el.fullValue || el.value
                  )
                )
            ) {
              const prevItem = [
                claim.usedElements,
                ...searchPath.map((n) => claims[n - 1].usedElements)
              ]
                .flat()
                .find((el) =>
                  RegExp(`${fullValue || value}$`).test(
                    el.fullValue || el.value
                  )
                );

              claim.matches = claim.matches.map((mm) => {
                if (mm.indexOfMatch === indexOfMatch) {
                  return {
                    ...mm,
                    group: prevItem.group,
                    keyFromGroup: getElementKeyByGroup(
                      prevItem.group,
                      descriptionOfElementMap
                    ),
                    pathIsOK: true,
                    prevMatchedElement: {
                      ...prevItem,
                      type: "usedElement"
                      // group: prevItem.group,
                      // start: prevItem.start,
                      // value: prevItem.value,
                      // item: prevItem.item,
                      // end: prevItem.end,
                      // claimNum: prevItem.claimNum
                    }
                  };
                }
                return mm;
              });
              return;
            }

            // 確定找不到
            if (!isTestMode) {
              const message =
                searchPath.length > 0
                  ? `元件名稱「${value}」未見於本請求項先前內容或所依附的請求項${searchPath
                      .map((e) => `(${e})`)
                      .join("其所依附的請求項")}中`
                  : `元件名稱「${value}」未見於本請求項先前內容`;
              claim.errors.push({
                message,
                start,
                end
              });
              if (
                !claim.nonMatches.find(
                  (mm) =>
                    mm.group === group && mm.start === start && mm.item === item
                )
              ) {
                claim.nonMatches.push({
                  group,
                  keyFromGroup: getElementKeyByGroup(
                    group,
                    descriptionOfElementMap
                  ),
                  item,
                  start,
                  end,
                  keys,
                  keyEnd,
                  keyStart,
                  keyBeenModified,
                  paths: [searchPath]
                });
              } else {
                claim.nonMatches[
                  claim.nonMatches.findIndex(
                    (mm) =>
                      mm.group === group &&
                      mm.start === start &&
                      mm.item === item
                  )
                ].paths.push(searchPath);
              }
            }
          } else {
            // 前面有該元件, 一「元件名稱」

            // Test
            // if (
            //   claim.num === 1 &&
            //   //searchPath.length === 1 &&
            //   //searchPath[0] === 1 &&
            //   value === "宮廟單元"
            // ) {
            //   console.log("check here 3");
            //   // console.log("isFirstPath: ", isFirstPath);
            //   // console.log("isTestMode:", isTestMode);
            //   console.log("prevItem: ", prevItem);
            //   console.log("start: ", start);
            //   console.log("value: ", value);
            //   debugger;
            // }

            if (!elementColorMap[group]) {
              elementColorMap[group] = {
                value,
                // color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                //   Math.random() * 255
                // )}, ${Math.floor(Math.random() * 255)}, .7)`
                color: pickColor(Object.keys(elementColorMap).length)
              };
            }

            const mStart = prevItem.index + prevItem[1].length;
            const mEnd = prevItem.index + prevItem[0].length;
            const prevMatchedElement = {
              type: "usedElement",
              group,
              keyFromGroup: getElementKeyByGroup(
                group,
                descriptionOfElementMap
              ),
              item,
              value: prevItem[0].slice(prevItem[1].length),
              start: mStart,
              end: mEnd,
              claimNum: currentClaimNum
            };

            // Test
            // if (claim.num === 1 && value === "鏡框") {
            //   console.log("prevMatchedElement", prevMatchedElement);
            //   debugger;
            // }

            if (
              !isTestMode &&
              !claims[currentClaimNum - 1].usedElements.some(
                (cu) => !(mStart >= cu.end || mEnd <= cu.start)
              )
            ) {
              claims[currentClaimNum - 1].usedElements.push(prevMatchedElement);
            }

            claim.matches = claim.matches.map((mm, matchIndex) => {
              if (mm.indexOfMatch === indexOfMatch) {
                return {
                  ...mm,
                  keyFromGroup: getElementKeyByGroup(
                    mm.group,
                    descriptionOfElementMap
                  ),
                  pathIsOK: true,
                  prevMatchedElement
                };
              }
              return mm;
            });
            // claim.matches[matchNum].pathIsOK = true;
          }
        }
      }
    }
  );

  // 2. 檢查請求項中不在符號說明的「該」元件
  [
    ...claim.matches
      .slice(1)
      .filter((mm) => !mm.isInDescriptionOfElementMap)
      .map((mm) => {
        mm.longestPrevMatch = getPrevMatchedStr(
          claims,
          claim,
          searchPath,
          mm.start,
          mm.item,
          isValueFixed
        );
        return mm;
      })
      .sort((a, b) => b.longestPrevMatch.length - a.longestPrevMatch.length)
    // .sort((a, b) => b.item.length - a.item.length)
  ].forEach(
    ({
      group,
      value,
      item,
      start,
      end,
      pathIsOK,
      // isInDescriptionOfElementMap,  // Test
      indexOfMatch
      // longestPrevMatch // Test
    }) => {
      // 跟上面的邏輯一樣，只是變成一個字個字由前往後找
      // Test
      // if (claim.num === 19) {
      //   console.log("longestPrevMatch: ", longestPrevMatch);
      //   console.log("value:", value);
      //   console.log("item:", item);
      //   //   console.log("pathIsOK: ", pathIsOK);
      //   //   console.log("indexOfMatch: ", indexOfMatch);
      //   //   console.log(
      //   //     "isInDescriptionOfElementMap: ",
      //   //     isInDescriptionOfElementMap
      //   //   );
      //   //   debugger;
      // }

      if (pathIsOK) {
        return;
      }

      /*const itemReg =
        value.length < 2 || isValueFixed
          ? value
          : value
              .split("")
              .reduce((acc, cur, _i) => {
                if (_i === 0) {
                  return [cur];
                }
                return [...acc, acc[acc.length - 1] + cur];
              }, [])
              .filter((e, _i) => _i !== 0 || e === "孔" || e === "洞")
              .reverse()
              .join("|");*/

      const itemReg =
        value.length < 2 || isValueFixed ? value : buildItemReg(value);

      // Test
      // if (claim.num === 1 && value === "試算功能") {
      //   console.log("itemReg: ", itemReg);
      //   debugger;
      // }

      // 1. 先檢查是否與主要元件名稱相符
      if (
        [claim.mainElement, ...searchPath.map((n) => claims[n - 1].mainElement)]
          // .map((mainElement) => mainElement.split(/[^\u4E00-\u9FFF]/)[0])
          .map((mainElement) => mainElement.split(/[\\(\\)]/)[0])
          .map((mainElement) =>
            mainElement.split(/[之的]/).length > 1
              ? [mainElement, ...mainElement.split(/[之的]/)]
              : [mainElement]
          )
          .flat()
          .some((el) => RegExp(`(${itemReg})$`).test(el))
      ) {
        // Test
        // if (claim.num === 2 && value === "金屬外殼上開口") {
        //   console.log("step 1");
        //   console.log(itemReg);
        //   debugger;
        // }
        const foundEl = [
          { mainElement: claim.mainElement, num: claim.num },
          ...searchPath.map((n) => ({
            mainElement: claims[n - 1].mainElement,
            num: claims[n - 1].num
          }))
        ]
          .map((mel) => ({
            ...mel,
            // mainElement: mel.mainElement.split(/[^\u4E00-\u9FFF]/)[0]
            mainElement: mel.mainElement.split(/[\\(\\)]/)[0]
          }))
          .map(({ mainElement, num }) =>
            mainElement.split(/[之的]/).length > 1
              ? [
                  { mainElement, num },
                  ...mainElement
                    .split(/[之的]/)
                    .map((mel) => ({ mainElement: mel, num }))
                ]
              : [{ mainElement, num }]
          )
          .flat()
          .find((el) => RegExp(`(${itemReg})$`).test(el.mainElement));

        const { num: wantedClaimNum, mainElement: prevItemName } = foundEl;

        claim.matches = claim.matches.map((mm) => {
          if (mm.indexOfMatch === indexOfMatch) {
            const prevMatchedElement = {
              ...claims[wantedClaimNum - 1].matches[0],
              type: "usedElement",
              claimNum: wantedClaimNum,
              isMainElement: true
            };

            const newItemName = prevItemName.match(RegExp(`(${itemReg})$`))[0];

            return {
              ...mm,
              group: prevMatchedElement.group,
              item: prevMatchedElement.item,
              value: newItemName,
              end: mm.start + newItemName.length,
              pathIsOK: true,
              prevMatchedElement
              // prevMatchedElement: {
              //   type: "usedElement",
              //   group: stringToUnicode(prevItemName),
              //   value: claims[wantedClaimNum - 1].mainElement,
              //   item: newItemName,
              //   start: claims[wantedClaimNum - 1].content.indexOf(
              //     claims[wantedClaimNum - 1].mainElement
              //   ),
              //   end:
              //     claims[wantedClaimNum - 1].content.indexOf(
              //       claims[wantedClaimNum - 1].mainElement
              //     ) + claims[wantedClaimNum - 1].mainElement.length,
              //   claimNum: wantedClaimNum,
              //   isMainElement: true
              // }
            };
          }
          return mm;
        });
        // return;
      } else if (
        // 2. 若不是，再檢查該元件是否已被記錄下來(檢查最長的value, 最長的找不到再去step3)
        [
          claim.usedElements,
          ...searchPath.map((n) => claims[n - 1].usedElements)
        ]
          .flat()
          // .some((el) => RegExp(`(${itemReg})$`).test(el.value))
          .some((el) => RegExp(`(${value})$`).test(el.value))
      ) {
        // Test
        // if (claim.num === 21 && value === "付款請求") {
        //   console.log("step 2");
        //   console.log("value: ", value);
        //   debugger;
        // }

        const prevItem = [
          claim.usedElements,
          ...searchPath.map((n) => claims[n - 1].usedElements)
        ]
          .flat()
          // .filter((el) => RegExp(`(${itemReg})$`).test(el.value))
          .filter((el) => RegExp(`(${value})$`).test(el.value))
          // .sort(
          //   (a, b) =>
          //     b.value.match(RegExp(`(${itemReg})$`))[0].length -
          //     a.value.match(RegExp(`(${itemReg})$`))[0].length
          // )[0];
          .sort(
            (a, b) =>
              b.value.match(RegExp(`(${value})$`))[0].length -
              a.value.match(RegExp(`(${value})$`))[0].length
          )[0];

        // Test
        // if (claim.num === 5 && value === "環境訊號") {
        //   console.log("itemReg: ", RegExp(`(${itemReg})$`));
        //   console.log("prevItem: ", prevItem);
        //   console.log("prevItemName: ", prevItem.item);
        //   debugger;
        // }

        // const prevItemName = prevItem.value;
        // const newItemName = prevItemName.match(RegExp(`(${itemReg})$`))[0];
        // const newItemName = prevItemName.match(RegExp(`(${value})$`))[0];
        claim.matches = claim.matches.map((mm) => {
          if (mm.indexOfMatch === indexOfMatch) {
            return {
              ...mm,
              //group: stringToUnicode(mm.value),
              group: prevItem.group,
              //value: mm.value,
              // value: newItemName,
              value,
              // item: newItemName,
              item: prevItem.item,
              end: mm.start + value.length,
              pathIsOK: true,
              prevMatchedElement: prevItem
            };
          }
          return mm;
        });
      } else {
        // 3. 最後，從前面的請求項內容中找是否有出現過
        // 如果下面的判別式改了，getPrevMatchedStr 那邊也要改
        // Test
        // if (claim.num === 1 && value === "試算功能") {
        //   console.log("step 3");
        //   console.log("itemReg: ", itemReg);
        //   debugger;
        // }

        let prevItem;
        let searchClaimsNum = [claim.num, ...searchPath];
        let currentClaimNum;
        do {
          let _currentClaimNum = searchClaimsNum.shift();
          const claimContent =
            _currentClaimNum === claim.num
              ? claims[_currentClaimNum - 1].content.slice(0, start)
              : claims[_currentClaimNum - 1].content;
          // 找到該請求項第一個 Match 的且不可與「該」元件名稱重疊
          let currentPrevItem = [
            [
              ...claimContent.matchAll(
                RegExp(
                  `(${getReferWords_1()})[^${getLimitedChar()}]{1,8}?(${itemReg})`,
                  "g"
                )
              )
            ].map((mp) => {
              mp.newIndex = mp.index + 10000;
              return mp;
            }),
            [
              ...claimContent.matchAll(
                RegExp(`(${getReferWords_1()})(${itemReg})`, "g")
              )
            ].map((mp) => {
              mp.newIndex = mp.index + 10000;
              return mp;
            }),
            [
              ...claimContent.matchAll(
                RegExp(
                  `(${getReferWords_2()})[^${getLimitedChar()}]{1,8}?(${itemReg})`,
                  "g"
                )
              )
            ].map((mp) => {
              mp.newIndex = mp.index + 20000;
              return mp;
            }),
            [
              ...claimContent.matchAll(
                RegExp(`(${getReferWords_2()})(${itemReg})`, "g")
              )
            ].map((mp) => {
              mp.newIndex = mp.index + 20000;
              return mp;
            }),
            [...claimContent.matchAll(RegExp(`()(${itemReg})`, "g"))].map(
              (mp) => {
                mp.newIndex = mp.index + 30000;
                return mp;
              }
            )
          ]
            .flat()
            .filter(
              (o) =>
                //!/(前述之|所述之|上述之|係用以|係用來|係用於|若干個|若干種|複數個|複數種|多數個|多數種|若干|一個|一種|二個|二種|複數|前述|所述|上述|其中|多個|多種|多數|具有|包含|包括|多|二|一|個|種|些|和|及|與|或|之|的|係|該|@|、|，|、|，|-|；|:|,|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」)/.test(
                !RegExp(allIgnoreMiddleWords()).test(
                  o[0]
                    .slice(o[1].length, o[0].length - o[2].length)
                    .replace(/^第./, "")
                )
            )
            .filter(
              (o) =>
                !RegExp(`[^\\u4E00-\\u9FFF${allSymbolChar}]`, "i").test(
                  o[0]
                    .slice(o[1].length, o[0].length - o[2].length)
                    .replace(/^第./, "")
                )
            )
            .filter(
              (o) =>
                !(
                  o[0] === "包" &&
                  (claimContent[o.index + 1] === "括" ||
                    claimContent[o.index + 1] === "含")
                )
            )
            .sort(
              (a, b) =>
                b[2].length - a[2].length ||
                b[0].slice(b[1].length).length -
                  a[0].slice(a[1].length).length ||
                a.newIndex - b.newIndex
            )
            .filter((plt) => {
              const matchedStr = plt[0].slice(plt[1].length);
              const extraPreStr = matchedStr.slice(
                0,
                matchedStr.match(RegExp(itemReg)).index
              );
              if (extraPreStr === "") return true;
              return !regExpsOrigin
                .map((og) => og.value)
                .find((v) => extraPreStr.includes(v));
            })
            .filter(
              (plt) =>
                !claims[_currentClaimNum - 1].matches.some(
                  (m) =>
                    !(
                      plt.index + plt[1].length >= m.end ||
                      plt.index + plt[0].length <= m.start
                    )
                )
            )
            .filter(
              (plt) =>
                !claims[_currentClaimNum - 1].preUsedElements
                  .filter(
                    // (pUsed) => pUsed.value !== plt[0].slice(plt[1].length)
                    (pUsed) =>
                      !itemReg
                        .split("|")
                        .find(
                          (ee) =>
                            pUsed.value.endsWith(ee) || ee.endsWith(pUsed.value)
                        )
                  )
                  .some(
                    (m) =>
                      !(
                        plt.index + plt[1].length >= m.end ||
                        plt.index + plt[0].length <= m.start
                      )
                  )
              // )[0];
            )
            .filter(
              (plt) =>
                !(
                  claims[_currentClaimNum - 1].usedElements.some(
                    (m) =>
                      !(
                        plt.index + plt[1].length >= m.end ||
                        plt.index + plt[0].length <= m.start
                      )
                  ) &&
                  claims[_currentClaimNum - 1].usedElements[
                    claims[_currentClaimNum - 1].usedElements.findIndex(
                      (m) =>
                        !(
                          plt.index + plt[1].length >= m.end ||
                          plt.index + plt[0].length <= m.start
                        )
                    )
                  ].end >
                    plt.index + plt[0].length
                )
            )[0];

          // Test
          // if (claim.num === 5 && item === "環境訊號") {
          //   console.log(`search claim: ${_currentClaimNum}`);
          //   console.log("currentPrevItem");
          //   console.log(currentPrevItem);
          //   debugger;
          // }

          if (
            currentPrevItem &&
            (!prevItem || currentPrevItem[2].length > prevItem[2].length)
          ) {
            prevItem = currentPrevItem;
            currentClaimNum = _currentClaimNum;
          }
        } while (searchClaimsNum.length > 0);
        if (!prevItem) {
          // 前面沒有該元件

          if (!isTestMode /*&& round === 2*/) {
            const message =
              searchPath.length > 0
                ? `元件名稱「${value}」未見於本請求項先前內容或所依附的請求項${searchPath
                    .map((e) => `(${e})`)
                    .join("其所依附的請求項")}中`
                : `元件名稱「${value}」未見於本請求項先前內容`;
            claim.errors.push({
              message,
              start,
              end
            });
            if (
              !claim.nonMatches.find(
                (mm) =>
                  mm.group === group && mm.start === start && mm.item === item
              )
            ) {
              claim.nonMatches.push({
                group,
                item,
                start,
                end,
                paths: [searchPath]
              });
            } else {
              claim.nonMatches[
                claim.nonMatches.findIndex(
                  (mm) =>
                    mm.group === group && mm.start === start && mm.item === item
                )
              ].paths.push(searchPath);
            }
          }
        } else {
          // 前面有該元件, 一「元件名稱」
          // 有2種況:
          // 1. prevItem 剛好就是先前的 usedElement, prevItem 的長度比usedElement長或一樣
          // 2. prevItem 不是先前的 usedElement

          const mStart = prevItem.index + prevItem[1].length;
          const mEnd = prevItem.index + prevItem[0].length;

          if (
            claims[currentClaimNum - 1].usedElements
              .filter((cu) =>
                currentClaimNum !== claim.num ? true : cu.start < start
              )
              .find(
                (cu) =>
                  !(mStart >= cu.end || mEnd <= cu.start) &&
                  mStart === cu.start &&
                  mEnd >= cu.end
              )
            // .find((cu) => !(mStart >= cu.end || mEnd <= cu.start))
          ) {
            // 1. 情況 1
            const prevMatchedElement = claims[currentClaimNum - 1].usedElements
              .filter((cu) =>
                currentClaimNum !== claim.num ? true : cu.start < start
              )
              .find(
                (cu) =>
                  !(mStart >= cu.end || mEnd <= cu.start) &&
                  mStart === cu.start &&
                  mEnd >= cu.end
              );
            // .find((cu) => !(mStart >= cu.end || mEnd <= cu.start));

            // Test
            /*try {
              prevMatchedElement.value.match(RegExp(`(${itemReg})$`))[0];
            } catch (e) {
              console.log("currentClaimNum: ", currentClaimNum);
              console.log("num: ", claim.num);
              console.log("mStart: ", mStart);
              console.log("mEnd: ", mEnd);
              console.log(RegExp(`(${itemReg})$`));
              console.log("start: ", start);
              console.log("prevMatchedElement");
              console.log(prevMatchedElement);
              debugger;
            }*/

            const mValue = prevMatchedElement.value.match(
              RegExp(`(${itemReg})$`)
            )[0];

            claim.matches = claim.matches.map((mm) => {
              if (mm.indexOfMatch === indexOfMatch) {
                return {
                  ...mm,
                  group: prevMatchedElement.group,
                  value: mValue,
                  item: prevMatchedElement.item,
                  // end: mm.start + prevItem[2].length,
                  end: mm.start + mValue.length,
                  pathIsOK: true,
                  prevMatchedElement
                };
              }
              return mm;
            });
          } else {
            // 2. 情況 2
            const mValue = prevItem[0].slice(prevItem[1].length);
            if (!elementColorMap[stringToUnicode(mValue)]) {
              elementColorMap[stringToUnicode(mValue)] = {
                value: mValue,
                // color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
                //   Math.random() * 255
                // )}, ${Math.floor(Math.random() * 255)}, .7)`
                color: pickColor(Object.keys(elementColorMap).length)
              };
            }

            const prevMatchedElement = {
              type: "usedElement",
              group: stringToUnicode(prevItem[0].slice(prevItem[1].length)),
              value: mValue,
              item: prevItem[2],
              start: mStart,
              end: mEnd,
              claimNum: currentClaimNum
            };
            if (
              !isTestMode &&
              !claims[currentClaimNum - 1].usedElements.some(
                (cu) => !(mStart >= cu.end || mEnd <= cu.start)
              )
            ) {
              claims[currentClaimNum - 1].usedElements.push(prevMatchedElement);
            } /*else if (
              !isTestMode &&
              claims[currentClaimNum - 1].usedElements.find(
                (cu) => !(mStart >= cu.end || mEnd <= cu.start)
              )
            ) {
              const usedElIdx = claims[
                currentClaimNum - 1
              ].usedElements.findIndex(
                (cu) => !(mStart >= cu.end || mEnd <= cu.start)
              );
              claims[currentClaimNum - 1].usedElements[
                usedElIdx
              ] = prevMatchedElement;
            }*/

            claim.matches = claim.matches.map((mm) => {
              if (mm.indexOfMatch === indexOfMatch) {
                return {
                  ...mm,
                  group: stringToUnicode(mValue),
                  value: mValue,
                  item: prevItem[2],
                  end: mm.start + prevItem[2].length,
                  pathIsOK: true,
                  prevMatchedElement
                };
              }
              return mm;
            });
            // claim.matches[matchNum].pathIsOK = true;
          }
        }
      }
    }
  );
};

function findAllPreUsedElements(
  claim,
  contentFirstIndex,
  regExpsOrigin,
  descriptionOfElementMap,
  figureOfDrawingsMap,
  concatRegExp,
  concatSymRegExp
) {
  let preUsedConcatElements = [];
  if (concatRegExp !== "" || concatSymRegExp !== "") {
    const concatMatchReg_1 = RegExp(
      `(${getReferWords_1()})((第[一二三四五六七八九十]([${concatWordSeparater}]第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*))`,
      "ig"
    );
    const concatMatchReg_2 = RegExp(
      `(${getReferWords_2()})((第[一二三四五六七八九十]([${concatWordSeparater}]第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*))`,
      "ig"
    );
    const concatMatchReg_3 = RegExp(
      `()((第[一二三四五六七八九十]([${concatWordSeparater}]第?[一二三四五六七八九十])+(${concatRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*))`,
      "ig"
    );
    const concatSymMatchReg_1 = RegExp(
      `(${getReferWords_1()})(([${symetricPrefix()}]([${concatWordSeparater}][${symetricPrefix()}])+(${concatSymRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*))`,
      "ig"
    );
    const concatSymMatchReg_2 = RegExp(
      `(${getReferWords_2()})(([${symetricPrefix()}]([${concatWordSeparater}][${symetricPrefix()}])+(${concatSymRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*))`,
      "ig"
    );
    const concatSymMatchReg_3 = RegExp(
      `()(([${symetricPrefix()}]([${concatWordSeparater}][${symetricPrefix()}])+(${concatSymRegExp}))\\(?([${allSymbolChar}']+\\)[~\\-]\\([${allSymbolChar}']+|[${allSymbolChar}\\-~']*)\\)?(([、,]\\(?[${allSymbolChar}\\-~']+\\)?)*))`,
      "ig"
    );

    const claimContent = claim.content.slice(contentFirstIndex);
    // console.log(concatMatchReg_1);
    // console.log([...claimContent.matchAll(concatMatchReg_1)]);
    // console.log(concatMatchReg_2);
    // console.log([...claimContent.matchAll(concatMatchReg_2)]);
    // console.log(concatMatchReg_3);
    // console.log([...claimContent.matchAll(concatMatchReg_3)]);

    const foundConcatElements = [
      [...claimContent.matchAll(concatMatchReg_1)].map((mp) => {
        mp.newIndex = mp.index + 10000;
        return mp;
      }),
      [...claimContent.matchAll(concatMatchReg_2)].map((mp) => {
        mp.newIndex = mp.index + 20000;
        return mp;
      }),
      [...claimContent.matchAll(concatMatchReg_3)].map((mp) => {
        mp.newIndex = mp.index + 30000;
        return mp;
      }),
      [...claimContent.matchAll(concatSymMatchReg_1)].map((mp) => {
        mp.newIndex = mp.index + 10000;
        return mp;
      }),
      [...claimContent.matchAll(concatSymMatchReg_2)].map((mp) => {
        mp.newIndex = mp.index + 20000;
        return mp;
      }),
      [...claimContent.matchAll(concatSymMatchReg_3)].map((mp) => {
        mp.newIndex = mp.index + 30000;
        return mp;
      })
    ]
      .flat()
      .sort((a, b) => a.newIndex - b.newIndex);

    foundConcatElements
      .map((match) => {
        // console.log(match);
        // debugger;
        if (
          match[7] &&
          RegExp(`[${allSymbolChar}']+$`, "i").test(match[7]) &&
          /^[@θ%度˚℃]/.test(claimContent.slice(match.index + match[0].length))
        ) {
          match[0] = match[0].split(/[、,]/).slice(0, -1).join("、");
          match[2] = match[2].split(/[、,]/).slice(0, -1).join("、");
          match[7] = match[7].split(/[、,]/).slice(0, -1).join("、");
          match[8] = match[8].split(/[、,]/).slice(0, -1).join("、");
        }
        return match;
      })
      .forEach((mm) => {
        if (
          !preUsedConcatElements.some(
            (p) =>
              !(
                mm.index >= p.index + p[0].length ||
                mm.index + mm[0].length <= p.index
              )
          )
        ) {
          preUsedConcatElements.push(mm);
        }
      });
  }

  // console.log(concatMatches);

  let preUsedElements = [];
  [...regExpsOrigin]
    // .map((o) => o.value)
    .sort((a, b) => b.value.length - a.value.length)
    .forEach((origin) => {
      // Test
      // if (value === "滅火劑" && claim.num === 8) {
      //   console.log("preUsed Claim: ", claim.num, " value: ", value);
      //   debugger;
      // }

      const { value } = origin;

      const claimContent = claim.content.slice(contentFirstIndex);
      let foundMatches = [
        /*[
          ...claimContent.matchAll(
            RegExp(
              `(${getReferWords_1()})[^${getLimitedChar()}]{1,8}?${value}`,
              "g"
            )
          )
        ].map((mp) => {
          mp.newIndex = mp.index + 10000;
          return mp;
        }),*/
        [
          ...claimContent.matchAll(
            RegExp(`(${getReferWords_1()})${value}`, "g")
          )
        ].map((mp) => {
          mp.newIndex = mp.index + 10000;
          return mp;
        }),
        /*[
          ...claimContent.matchAll(
            RegExp(
              `(${getReferWords_2()})[^${getLimitedChar()}]{1,8}?${value}`,
              "g"
            )
          )
        ].map((mp) => {
          mp.newIndex = mp.index + 20000;
          return mp;
        }),*/
        [
          ...claimContent.matchAll(
            RegExp(`(${getReferWords_2()})${value}`, "g")
          )
        ].map((mp) => {
          mp.newIndex = mp.index + 20000;
          return mp;
        }),
        [...claimContent.matchAll(RegExp(`()${value}`, "g"))].map((mp) => {
          mp.newIndex = mp.index + 30000;
          return mp;
        })
      ]
        .flat()
        .filter(
          (match) =>
            !preUsedConcatElements.some(
              (mt) =>
                !(
                  match.index + match[0].length <= mt.index ||
                  match.index >= mt.index + mt[0].length
                )
            )
        )
        .filter(
          (o) =>
            //!/(前述之|所述之|上述之|係用以|係用來|係用於|若干個|若干種|複數個|複數種|多數個|多數種|若干|一個|一種|二個|二種|複數|前述|所述|上述|其中|多個|多種|多數|具有|包含|包括|多|二|一|個|種|些|和|及|與|或|之|的|係|該|@|、|，|、|，|-|；|:|,|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」)/.test(
            !RegExp(allIgnoreMiddleWords()).test(
              o[0]
                .slice(o[1].length, o[0].length - value.length)
                .replace(/^第./, "")
            )
        )
        .sort(
          (a, b) =>
            a.newIndex - b.newIndex ||
            b[0].slice(b[1].length).length - a[0].slice(a[1].length).length
        );

      // Test
      // if (value === "滅火劑" && claim.num === 8) {
      //   console.log("preUsed Claim: ", claim.num, " value: ", value);
      //   console.log("match before filter: ");
      //   console.log(
      //     [
      //       [
      //         ...claimContent.matchAll(
      //           RegExp(
      //             `(${getReferWords_1()})[^${getLimitedChar()}]{1,8}?${value}`,
      //             "g"
      //           )
      //         )
      //       ].map((mp) => {
      //         mp.newIndex = mp.index + 10000;
      //         return mp;
      //       }),
      //       [
      //         ...claimContent.matchAll(
      //           RegExp(`(${getReferWords_1()})${value}`, "g")
      //         )
      //       ].map((mp) => {
      //         mp.newIndex = mp.index + 10000;
      //         return mp;
      //       }),
      //       [
      //         ...claimContent.matchAll(
      //           RegExp(
      //             `(${getReferWords_2()})[^${getLimitedChar()}]{1,8}?${value}`,
      //             "g"
      //           )
      //         )
      //       ].map((mp) => {
      //         mp.newIndex = mp.index + 20000;
      //         return mp;
      //       }),
      //       [
      //         ...claimContent.matchAll(
      //           RegExp(`(${getReferWords_2()})${value}`, "g")
      //         )
      //       ].map((mp) => {
      //         mp.newIndex = mp.index + 20000;
      //         return mp;
      //       }),
      //       [...claimContent.matchAll(RegExp(`()${value}`, "g"))].map((mp) => {
      //         mp.newIndex = mp.index + 30000;
      //         return mp;
      //       })
      //     ].flat()
      //   );
      //   // console.log(foundMatches);
      //   debugger;
      // }

      foundMatches.forEach((mm) => {
        if (
          !preUsedElements.some(
            (m) =>
              !(
                mm.index + mm[1].length >= m.end ||
                mm.index + mm[0].length <= m.start
              )
          )
        ) {
          preUsedElements.push({
            type: "preUsedElements",
            // group: stringToUnicode(value),
            group: stringToUnicode(
              getMapValues(descriptionOfElementMap, figureOfDrawingsMap, origin)
                ?.values[0] || value
            ),
            item:
              getMapValues(descriptionOfElementMap, figureOfDrawingsMap, origin)
                ?.values[0] || value,
            value: mm[0].slice(mm[1].length),
            start: mm.index + mm[1].length,
            end: mm.index + mm[0].length,
            claimNum: claim.num
          });
        }
      });
    }); // each value

  // console.log(preUsedElements);
  // console.log(preUsedConcatElements);
  // debugger;

  preUsedConcatElements.forEach((match) => {
    // console.log(match);
    // debugger;
    let keyBeenModified = false;
    const item = match[3]; // 元件
    const matchValue = match[2]; // 元件+符號
    const items = item.split(RegExp(`[${concatWordSeparater}]`)).map((it) => {
      if (item.startsWith("第")) {
        return "第" + it[it.match(/[一二三四五六七八九十]/).index] + match[5];
      } else {
        return it[it.match(RegExp(`[${symetricPrefix()}]`)).index] + match[5];
      }
      // return "第" + it[it.match(/[一二三四五六七八九十]/).index] + match[5];
    });
    let keys =
      match[7] === ""
        ? [match[6].replaceAll(/[()]/g, "")]
        : match[7]
        ? [
            match[6],
            ...match[7]
              .replaceAll(/[()]/g, "")
              .split(/[、,]/)
              .filter((e) => e !== "")
          ]
        : [""];
    // if (/.+[~-].+/.test(keys[0])) {
    //   keyBeenModified = true;
    //   keys = getKeyInRange(keys[0]);
    // }
    if (keys.some((curKey) => /.+[-~～].+/.test(curKey))) {
      // keyBeenModified = true;
      keys = keys.reduce((accKeys, curKey) => {
        if (/.+[-~～].+/.test(curKey)) {
          const _keyInRange = getKeyInRange(curKey);
          if (_keyInRange.length > 0) {
            keyBeenModified = true;
          }
          return [...accKeys, ..._keyInRange];
        }
        return [...accKeys, curKey];
      }, []);
    }
    keys =
      keys.length === 1 && keys[0] === ""
        ? keys
        : keys
            .filter((k) => k !== "")
            .filter((k) => !isKeyInReserve(k) && isKeyValid(k));
    keys = Array.from(new Set(keys));

    items.forEach((_item, _itemIdx) => {
      const matchIndex = regExpsOrigin.map((o) => o.value).indexOf(_item);
      const value = item.split(RegExp(`[${concatWordSeparater}]`))[_itemIdx];
      const fullValue = _item;
      let start = match.index + match[1].length;
      item
        .split(RegExp(`[${concatWordSeparater}]`))
        .filter((iitt, iiddxx) => iiddxx < _itemIdx)
        .forEach((iitt) => {
          start += iitt.length + 1;
        });
      const end =
        _itemIdx === items.length - 1
          ? match.index + match[1].length + item.length
          : start + value.length;
      const key =
        keys[_itemIdx] && keys[_itemIdx] !== "" ? keys[_itemIdx] : null;
      const keyStart = key
        ? match.index + match[1].length + matchValue.indexOf(key)
        : -100;
      const keyEnd = key ? keyStart + key.length : -100;

      // finalMatches.push({
      //   isInDescriptionOfElementMap: true,
      //   pathIsOK: false,
      //   start,
      //   end,
      //   group:
      //     matchIndex >= 0
      //       ? stringToUnicode(regExpsOrigin[matchIndex].value)
      //       : stringToUnicode(_item),
      //   item: matchIndex >= 0 ? regExpsOrigin[matchIndex].value : _item,
      //   value,
      //   fullValue: _item,
      //   key,
      //   keyStart,
      //   keyEnd
      // });
      if (matchIndex >= 0) {
        preUsedElements.push({
          type: "preUsedElements",
          // group: stringToUnicode(regExpsOrigin[matchIndex].value),
          group: stringToUnicode(
            (matchIndex >= 0 &&
              getMapValues(
                descriptionOfElementMap,
                figureOfDrawingsMap,
                regExpsOrigin[matchIndex]
              )?.values[0]) ||
              _item
          ),
          item:
            getMapValues(
              descriptionOfElementMap,
              figureOfDrawingsMap,
              regExpsOrigin[matchIndex]
            )?.values[0] || _item,
          // item: regExpsOrigin[matchIndex].value,
          value,
          fullValue,
          start,
          end,
          claimNum: claim.num,
          keys: key ? [key] : null,
          keyStart,
          keyEnd,
          keyBeenModified
        });
      }
    }); // each item
  });

  claim.preUsedElements = preUsedElements
    .map((pre) => ({
      ...pre,
      start: pre.start + contentFirstIndex,
      end: pre.end + contentFirstIndex,
      keyStart:
        pre.keyStart && pre.keyStart >= 0
          ? pre.keyStart + contentFirstIndex
          : null,
      keyEnd:
        pre.keyEnd && pre.keyEnd >= 0 ? pre.keyEnd + contentFirstIndex : null
    }))
    .sort((a, b) => a.start - b.start);

  claim.preUsedShortElements = claim.preUsedElements.filter(
    (pre) => pre.fullValue
  );

  // Test
  // console.log("claim.preUsedElements");
  // console.log(claim.preUsedElements);
  // console.log("claim.preUsedShortElements");
  // console.log(claim.preUsedShortElements);
  // debugger;
}

function getPrevMatchedStr(
  claims,
  claim,
  searchPath,
  start,
  item,
  isValueFixed
) {
  /*const itemReg =
    item.length < 2 || isValueFixed
      ? item
      : item
          .split("")
          .reduce((acc, cur, _i) => {
            if (_i === 0) {
              return [cur];
            }
            return [...acc, acc[acc.length - 1] + cur];
          }, [])
          .filter((e, _i) => _i !== 0 || e === "孔" || e === "洞")
          .reverse()
          .join("|");*/

  const itemReg = item.length < 2 || isValueFixed ? item : buildItemReg(item);

  let prevItem;
  let searchClaimsNum = [claim.num, ...searchPath];
  do {
    let _currentClaimNum = searchClaimsNum.shift();
    const claimContent =
      _currentClaimNum === claim.num
        ? claims[_currentClaimNum - 1].content.slice(0, start)
        : claims[_currentClaimNum - 1].content;
    // 找到該請求項第一個 Match 的且不可與「該」元件名稱重疊
    let currentPrevItem = [
      [
        ...claimContent.matchAll(
          RegExp(
            `(${getReferWords_1()})[^${getLimitedChar()}]{1,8}?(${itemReg})`,
            "g"
          )
        )
      ].map((mp) => {
        mp.newIndex = mp.index + 10000;
        return mp;
      }),
      [
        ...claimContent.matchAll(
          RegExp(`(${getReferWords_1()})(${itemReg})`, "g")
        )
      ].map((mp) => {
        mp.newIndex = mp.index + 10000;
        return mp;
      }),
      [
        ...claimContent.matchAll(
          RegExp(
            `(${getReferWords_2()})[^${getLimitedChar()}]{1,8}?(${itemReg})`,
            "g"
          )
        )
      ].map((mp) => {
        mp.newIndex = mp.index + 20000;
        return mp;
      }),
      [
        ...claimContent.matchAll(
          RegExp(`(${getReferWords_2()})(${itemReg})`, "g")
        )
      ].map((mp) => {
        mp.newIndex = mp.index + 20000;
        return mp;
      }),
      [...claimContent.matchAll(RegExp(`()(${itemReg})`, "g"))].map((mp) => {
        mp.newIndex = mp.index + 30000;
        return mp;
      })
    ]
      .flat()
      .filter(
        (o) =>
          //!/(前述之|所述之|上述之|係用以|係用來|係用於|若干個|若干種|複數個|複數種|多數個|多數種|若干|一個|一種|二個|二種|複數|前述|所述|上述|其中|多個|多種|多數|具有|包含|包括|多|二|一|個|種|些|和|及|與|或|之|的|係|該|@|、|，|、|，|-|；|:|,|\\|\?|\.|\+|\[|\]|\(|\)|{|}|「|」)/.test(
          !RegExp(allIgnoreMiddleWords()).test(
            o[0]
              .slice(o[1].length, o[0].length - o[2].length)
              .replace(/^第./, "")
          )
      )
      .filter(
        (o) =>
          !RegExp(`[^\\u4E00-\\u9FFF${allSymbolChar}]`, "i").test(
            o[0].slice(o[1].length)
          )
      )
      .filter(
        (o) =>
          !(
            o[0] === "包" &&
            (claimContent[o.index + 1] === "括" ||
              claimContent[o.index + 1] === "含")
          )
      )
      .sort(
        (a, b) =>
          b[2].length - a[2].length ||
          b[0].slice(b[1].length).length - a[0].slice(a[1].length).length ||
          a.newIndex - b.newIndex
      )
      .filter(
        (plt) =>
          !claims[_currentClaimNum - 1].matches.some(
            (m) =>
              !(
                plt.index + plt[1].length >= m.end ||
                plt.index + plt[0].length <= m.start
              )
          )
      )
      .filter(
        (plt) =>
          !claims[_currentClaimNum - 1].preUsedElements
            .filter(
              // (pUsed) => pUsed.value !== plt[0].slice(plt[1].length)
              (pUsed) =>
                !itemReg.split("|").find((ee) => pUsed.value.endsWith(ee))
            )
            .some(
              (m) =>
                !(
                  plt.index + plt[1].length >= m.end ||
                  plt.index + plt[0].length <= m.start
                )
            )
        // )[0];
      )
      .filter(
        (plt) =>
          !(
            claims[_currentClaimNum - 1].usedElements.some(
              (m) =>
                !(
                  plt.index + plt[1].length >= m.end ||
                  plt.index + plt[0].length <= m.start
                )
            ) &&
            claims[_currentClaimNum - 1].usedElements[
              claims[_currentClaimNum - 1].usedElements.findIndex(
                (m) =>
                  !(
                    plt.index + plt[1].length >= m.end ||
                    plt.index + plt[0].length <= m.start
                  )
              )
            ].end >
              plt.index + plt[0].length
          )
      )[0];

    // Test
    // if (claim.num === 10 && item === "待付款資訊予") {
    //   console.log(`search claim: ${_currentClaimNum}`);
    //   console.log(
    //     "search claim usedElements: ",
    //     claims[_currentClaimNum - 1].usedElements
    //   );
    //   console.log("currentPrevItem");
    //   console.log(currentPrevItem);
    //   debugger;
    // }

    if (
      currentPrevItem &&
      (!prevItem || currentPrevItem[2].length > prevItem[2].length)
    ) {
      prevItem = currentPrevItem;
    }
  } while (searchClaimsNum.length > 0);

  if (!prevItem) {
    return "";
  } else {
    return prevItem[2];
  }
}

function buildItemReg(item) {
  const allItemRegs = Array(item.length)
    .fill(null)
    .map((_, regIdx) => item.slice(0, regIdx + 1))
    .reverse();

  if (/^第[一二三四五六七八九十]/.test(item)) {
    // 留前3個中文字
    return allItemRegs.slice(0, -2).join("|");
  } else if (!item.startsWith("孔") && !item.startsWith("洞")) {
    // 留前2個中文字
    return allItemRegs.slice(0, -1).join("|");
  }
}

function getElementKeyByGroup(group, descriptionOfElementMap) {
  return Object.entries(descriptionOfElementMap).find(
    (ent) => ent[1].id === group
  )?.[0];
}
