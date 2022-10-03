import { stringToUnicode } from "./stringToUnicode";
import { findMatches } from "./findMatches";
import { checkKeyCorrect } from "./checkKeyCorrect";
import { getKeyInRange, isKeyInReserve } from "./otherUtils";
import { allSeperatedWords } from "../dict/allSeperatedWords";
import { symetricPrefix } from "../dict/allReferWords";
import { concatWordSeparater } from "../dict/concatWordSeparater";
import { isKeyValid } from "../dict/keyRegs";
import { getMapValues } from "./otherUtils";

export const modifySingleParagraph = (
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
) => {
  try {
    let paragraph = content.replace(/\s/g, "");
    const matches = findMatches(
      applicationNum,
      paragraph,
      regExp,
      concatRegExp,
      concatSymRegExp,
      regExpWithWrongChar,
      descriptionOfElementMap,
      figureOfDrawingsMap,
      allDrawings
    );
    // Test
    // if (
    //   paragraph.includes(
    //     "本創作提供一種複合鞋釘，包括由第一材料製成的第一部件以及由異於第一材料的第二材料製成的第二部件。"
    //   )
    // ) {
    //   console.log(matches);
    //   debugger;
    // }

    let paragraphMatch = {
      figures: [],
      figuresErrors: [],
      corrects: [],
      wrongs: [],
      potentialErrors: [],
      wrongWords: [],
      aboriginalWords: []
    };

    for (let i = matches.length - 1; i >= 0; i--) {
      if (matches[i].type === "figure") {
        // console.log(matches[i]);
        // debugger;
        const start = matches[i].index;
        const end = matches[i].index + matches[i][0].length;
        const figs = [...matches[i].keys].reverse();
        let copyParagraph = paragraph;
        let hasWrongFigs = false;
        let wrongFigNotInText = false;

        figs.forEach((fig) => {
          if (allDrawings.find((drawing) => drawing.fig === fig)) {
            // Figure is correct
            if (
              matches[i][0].match(
                RegExp(
                  `圖?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                    fig.slice(1)
                  )})`
                )
              ) ||
              matches[i][0].match(
                RegExp(
                  `第?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                    fig.slice(1)
                  )})圖?`
                )
              )
            ) {
              // 圖X 有出現在文字中
              const figMatch_1 = matches[i][0].match(
                RegExp(
                  `圖?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                    fig.slice(1)
                  )})`
                )
              );
              const figMatch_2 = matches[i][0].match(
                RegExp(
                  `第?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                    fig.slice(1)
                  )})圖?`
                )
              );
              const figMatch =
                figMatch_1[0].length > figMatch_2[0].length
                  ? figMatch_1
                  : figMatch_2;
              const figStart = start + figMatch.index;
              const figEnd = figStart + figMatch[0].length;
              copyParagraph = [
                copyParagraph.slice(0, figEnd),
                `</i>`,
                copyParagraph.slice(figEnd)
              ].join("");
              copyParagraph = [
                copyParagraph.slice(0, figStart),
                `<i class='figure f-${stringToUnicode(fig)}'>`,
                copyParagraph.slice(figStart)
              ].join("");
              paragraphMatch.figures.unshift({
                group: stringToUnicode(fig),
                fig,
                start: figStart,
                end: figEnd
              });
            } else {
              // 圖X 未出現在文字中
              paragraphMatch.figures.unshift({
                group: stringToUnicode(fig),
                fig,
                start,
                end
              });
            }

            return;
          }

          // Figure has error
          hasWrongFigs = true;

          if (
            matches[i][0].match(
              RegExp(
                `圖?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                  fig.slice(1)
                )})`
              )
            ) ||
            matches[i][0].match(
              RegExp(
                `第?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                  fig.slice(1)
                )})圖?`
              )
            )
          ) {
            // 圖X 有出現在文字中
            const figMatch_1 = matches[i][0].match(
              RegExp(
                `圖?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                  fig.slice(1)
                )})`
              )
            );
            const figMatch_2 = matches[i][0].match(
              RegExp(
                `第?\\(?${trimFig(fig.slice(1))}\\)?(?!.*${trimFig(
                  fig.slice(1)
                )})圖?`
              )
            );
            const figMatch =
              figMatch_1[0].length > figMatch_2[0].length
                ? figMatch_1
                : figMatch_2;
            const figStart = start + figMatch.index;
            const figEnd = figStart + figMatch[0].length;

            copyParagraph = [
              copyParagraph.slice(0, figEnd),
              `</i>`,
              copyParagraph.slice(figEnd)
            ].join("");
            copyParagraph = [
              copyParagraph.slice(0, figStart),
              `<i class='errorfigure ef-${stringToUnicode(fig)}'>`,
              copyParagraph.slice(figStart)
            ].join("");
            paragraphMatch.figuresErrors.unshift({
              group: stringToUnicode(fig),
              fig,
              start: figStart,
              end: figEnd
            });
          } else {
            // 圖X 未出現在文字中
            wrongFigNotInText = true;
            paragraphMatch.figuresErrors.unshift({
              group: stringToUnicode(fig),
              fig,
              start,
              end
            });
          }
        });

        if (!hasWrongFigs || (hasWrongFigs && !wrongFigNotInText)) {
          paragraph = copyParagraph;
        } else {
          paragraph = [
            paragraph.slice(0, end),
            `</i>`,
            paragraph.slice(end)
          ].join("");
          paragraph = [
            paragraph.slice(0, start),
            `<i class='errorfigure'>`,
            paragraph.slice(start)
          ].join("");
        }
      } else if (matches[i].type === "wrongWords") {
        const start = matches[i].index;
        const end = matches[i].index + matches[i][0].length;
        const value = matches[i][0];

        paragraph = [
          paragraph.slice(0, end),
          `</i>`,
          paragraph.slice(end)
        ].join("");
        paragraph = [
          paragraph.slice(0, start),
          `<i class='error ew-${stringToUnicode(value)}'>`,
          paragraph.slice(start)
        ].join("");
        paragraphMatch.wrongWords.unshift({
          group: stringToUnicode(value),
          value,
          start,
          end
        });
      } else if (matches[i].type === "aboriginalWords") {
        const start = matches[i].index;
        const end = matches[i].index + matches[i][0].length;
        const value = matches[i][0];

        paragraph = [
          paragraph.slice(0, end),
          `</i>`,
          paragraph.slice(end)
        ].join("");
        paragraph = [
          paragraph.slice(0, start),
          `<i class='aboriginal ab-${stringToUnicode(value)}'>`,
          paragraph.slice(start)
        ].join("");
        paragraphMatch.aboriginalWords.unshift({
          group: stringToUnicode(value),
          value,
          start,
          end
        });
      } else if (matches[i].type === "symbol") {
        // console.log(matches[i]);
        // debugger;
        const start = matches[i].index;
        const end = matches[i].index + matches[i][0].length;
        const value = matches[i].prevElement;
        const keys = matches[i].keys;
        const potentialElement = matches[i].potentialElement;
        if (
          dataType !== "allAbstractParagraphDetails" &&
          dataType !== "allTechnicalFieldParagraphDetails" &&
          dataType !== "allBackgroundArtParagraphDetails"
        ) {
          paragraph = [
            paragraph.slice(0, end),
            `</i>`,
            paragraph.slice(end)
          ].join("");
          paragraph = [
            paragraph.slice(0, start),
            `<i class='potentialError pe-${stringToUnicode(value)}'>`,
            paragraph.slice(start)
          ].join("");
        }
        paragraphMatch.potentialErrors.unshift({
          group: stringToUnicode(value),
          value,
          item:
            "「" +
            value +
            keys.join("、") +
            "」是否為「" +
            potentialElement +
            keys.join("、") +
            "」",
          keys /*: [""]*/,
          start,
          end
        });
      } else if (matches[i].type === "concatMatch") {
        // 檢查複合式元件 e.g. 第一、第二凹凸結構100、200
        // Test
        // console.log(matches[i]);
        // debugger;
        let keyBeenModified = false;
        let hasAnyError = false;
        const item = matches[i][1]; // 元件
        const items = item
          .split(RegExp(`[${concatWordSeparater}]`))
          .map((it) => {
            if (item.startsWith("第")) {
              return (
                "第" +
                it[it.match(/[一二三四五六七八九十]/).index] +
                matches[i][3]
              );
            } else {
              return (
                it[it.match(RegExp(`[${symetricPrefix()}]`)).index] +
                matches[i][3]
              );
            }
          });

        // Test
        // console.log("item", item);
        // console.log("items", items);
        // debugger;

        let keys =
          matches[i][5] === ""
            ? [matches[i][4].replaceAll(/[()]/g, "")]
            : matches[i][5]
            ? [
                matches[i][4],
                ...matches[i][5]
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
          // keys = getKeyInRange(keys[0]);
        }
        keys =
          keys.length === 1 && keys[0] === ""
            ? keys
            : keys
                .filter((k) => k !== "")
                .filter((k) => !isKeyInReserve(k) && isKeyValid(k));
        keys = Array.from(new Set(keys));

        let paragraphReplacements = [];

        // [...keys].filter((k) => k !== "").reverse().forEach((_key, _kIdx) => {
        //   const _keyIdx = keys - 1 - _kIdx;
        //   if (
        //     descriptionOfElementMap[keys[_keyIdx]] &&
        //     descriptionOfElementMap[keys[_keyIdx]].values.includes(items[_keyIdx])
        //   ) {

        //   }

        // });

        items.forEach((_item, _itemIdx) => {
          /// const _itemIdx = item.split("、").length - 1 - _itIdx;
          const matchIndex = regExpsOrigin.map((o) => o.value).indexOf(_item);
          const value = item.split(RegExp(`[${concatWordSeparater}]`))[
            _itemIdx
          ];
          let start = matches[i].index;
          item
            .split(RegExp(`[${concatWordSeparater}]`))
            .filter((iitt, iiddxx) => iiddxx < _itemIdx)
            .forEach((iitt) => {
              start += iitt.length + 1;
            });
          const end =
            _itemIdx === items.length - 1
              ? matches[i].index + matches[i][1].length
              : start + value.length;
          const keyStart = keys[_itemIdx]
            ? matches[i].index + matches[i][0].indexOf(keys[_itemIdx])
            : -100;
          const keyEnd = keys[_itemIdx]
            ? keyStart + keys[_itemIdx].length
            : -100;

          if (matchIndex >= 0) {
            // 元件名稱正確
            if (keys[_itemIdx] && keys[_itemIdx] !== "") {
              // 有符號
              if (
                isKeyInMapValue(
                  keys[_itemIdx],
                  _item,
                  descriptionOfElementMap,
                  figureOfDrawingsMap
                ) ||
                hasDuplicateKey(
                  keys[_itemIdx],
                  _item,
                  descriptionOfElementMap
                ) ||
                isKeyInReserve(keys[_itemIdx])
              ) {
                // 符號正確
                paragraphMatch.corrects.unshift({
                  group: stringToUnicode(
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || _item
                  ),
                  value,
                  item:
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || _item,
                  keys: [keys[_itemIdx]],
                  start,
                  end,
                  keyStart,
                  keyEnd
                });
                const replacement = `<span class="c-${stringToUnicode(
                  getMapValues(
                    descriptionOfElementMap,
                    figureOfDrawingsMap,
                    regExpsOrigin[matchIndex]
                  )?.values[0] || _item
                )}">`;
                if (!keyBeenModified) {
                  paragraphReplacements.push({
                    start: keyStart,
                    end: keyEnd,
                    replacement
                  });
                }
                paragraphReplacements.push({
                  start,
                  end,
                  replacement
                });
              } else {
                // 符號錯誤
                hasAnyError = true;

                paragraphMatch.wrongs.unshift({
                  group: stringToUnicode(
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || _item
                  ),
                  item:
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || _item,
                  value: item,
                  fullValue:
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || _item,
                  wrongKeys: [keys[_itemIdx]]
                });

                if (
                  dataType !== "allAbstractParagraphDetails" &&
                  dataType !== "allTechnicalFieldParagraphDetails" &&
                  dataType !== "allBackgroundArtParagraphDetails"
                ) {
                  const replacement = `<i class="error e-${stringToUnicode(
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || _item
                  )}">`;
                  if (!keyBeenModified) {
                    paragraphReplacements.push({
                      start: keyStart,
                      end: keyEnd,
                      replacement,
                      type: "error"
                    });
                  }
                  paragraphReplacements.push({
                    start,
                    end,
                    replacement,
                    type: "error"
                  });
                }
              }
            } else {
              // 沒有符號
              paragraphMatch.corrects.unshift({
                group: stringToUnicode(
                  getMapValues(
                    descriptionOfElementMap,
                    figureOfDrawingsMap,
                    regExpsOrigin[matchIndex]
                  )?.values[0] || _item
                ),
                value,
                item:
                  getMapValues(
                    descriptionOfElementMap,
                    figureOfDrawingsMap,
                    regExpsOrigin[matchIndex]
                  )?.values[0] || _item,
                keys: [],
                start,
                end,
                keyStart,
                keyEnd
              });
              paragraphReplacements.push({
                start,
                end,
                replacement: `<span class="c-${stringToUnicode(
                  getMapValues(
                    descriptionOfElementMap,
                    figureOfDrawingsMap,
                    regExpsOrigin[matchIndex]
                  )?.values[0] || _item
                )}">`
              });
            }
          } else {
            // 元件名稱錯誤
            if (keys[_itemIdx] && keys[_itemIdx] !== "" && !keyBeenModified) {
              // 有符號
              if (
                regExpsOrigin
                  .map((og) => og.key)
                  .find((ogkey) => ogkey === keys[_itemIdx])
              ) {
                // 元件名稱錯誤 有符號且該符號存在
                hasAnyError = true;
                paragraphMatch.wrongs.unshift({
                  group: stringToUnicode(_item),
                  item: _item,
                  value: _item,
                  wrongKeys: [keys[_itemIdx]]
                });

                if (
                  dataType !== "allAbstractParagraphDetails" &&
                  dataType !== "allTechnicalFieldParagraphDetails" &&
                  dataType !== "allBackgroundArtParagraphDetails"
                ) {
                  paragraphReplacements.push({
                    start,
                    end,
                    replacement: `<i class="error e-${stringToUnicode(
                      _item
                    )}">`,
                    type: "error"
                  });

                  paragraphReplacements.push({
                    start: keyStart,
                    end: keyEnd,
                    replacement: `<i class="error e-${stringToUnicode(
                      _item
                    )}">`,
                    type: "error"
                  });
                }
              } else {
                // 元件名稱錯誤 有符號但該符號不存在
                const closestItem = findClosestItem(regExpsOrigin, _item);
                paragraphMatch.potentialErrors.unshift({
                  group: stringToUnicode(_item),
                  item: closestItem
                    ? _item + keys[_itemIdx] + "：是否為「" + closestItem + "」"
                    : _item,
                  value: _item,
                  start,
                  end,
                  keys: [keys[_itemIdx]]
                });

                if (
                  dataType !== "allAbstractParagraphDetails" &&
                  dataType !== "allTechnicalFieldParagraphDetails" &&
                  dataType !== "allBackgroundArtParagraphDetails"
                ) {
                  paragraphReplacements.push({
                    start,
                    end,
                    replacement: `<i class="potentialError pe-${stringToUnicode(
                      _item
                    )}">`,
                    type: "potentialError"
                  });

                  paragraphReplacements.push({
                    start: keyStart,
                    end: keyEnd,
                    replacement: `<i class="potentialError pe-${stringToUnicode(
                      _item
                    )}">`,
                    type: "potentialError"
                  });
                }
              }
            } else if (!keyBeenModified) {
              // 沒有符號
              if (
                dataType !== "allAbstractParagraphDetails" &&
                dataType !== "allTechnicalFieldParagraphDetails" &&
                dataType !== "allBackgroundArtParagraphDetails"
              ) {
                paragraphReplacements.push({
                  start,
                  end,
                  replacement: `<i class="potentialError pe-${stringToUnicode(
                    _item
                  )}">`,
                  type: "potentialError"
                });
              }

              const closestItem = findClosestItem(regExpsOrigin, _item);
              paragraphMatch.potentialErrors.unshift({
                group: stringToUnicode(_item),
                value: _item,
                item: closestItem
                  ? _item + "：是否為「" + closestItem + "」"
                  : _item,
                keys: [],
                start,
                end
              });
            }
          }
        }); // each item

        if (keyBeenModified && hasAnyError) {
          paragraphReplacements.push({
            start: matches[i].index + matches[i][1].length,
            end: matches[i].index + matches[i][0].length,
            replacement: `<i class="error">`,
            type: "error"
          });
        }

        paragraphReplacements
          .sort((a, b) => b.start - a.start)
          .forEach(({ start, end, replacement, type }) => {
            paragraph = [
              paragraph.slice(0, end),
              type === "error" || type === "potentialError"
                ? `</i>`
                : `</span>`,
              paragraph.slice(end)
            ].join("");
            paragraph = [
              paragraph.slice(0, start),
              replacement,
              paragraph.slice(start)
            ].join("");
          });

        // Test
        // if (
        //   paragraph.includes(
        //     "從第3、4圖中可以看出，本實施例之緩衝元件30具有一頂部31、一第一側壁部321、一第二側壁部322以及一弧狀部33"
        //   )
        // ) {
        //   console.log(matches[i]);
        //   console.log("items: ", items);
        //   console.log("keys: ", keys);
        //   console.log("keybeenModified: ", keyBeenModified);
        //   console.log("hasAnyError: ", hasAnyError);
        //   debugger;
        // }
      } else {
        // 檢查元件
        let keyBeenModified = false;
        let value = matches[i][0]; // 元件+符號
        if ([...value.matchAll(/[()]/g)].length === 1 && /[()]$/.test(value)) {
          // value: "無線收發器11)"  刪掉最後的括號
          value = value.slice(0, value.length - 1);
        }
        const item = matches[i][1]; // 元件
        let keys =
          matches[i][3] === ""
            ? [matches[i][2].replaceAll(/[()]/g, "")]
            : matches[i][3]
            ? [
                matches[i][2],
                ...matches[i][3]
                  .replaceAll(/[()]/g, "")
                  .split(/[、,]/)
                  .filter((e) => e !== "")
              ]
            : [""];

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
          // keys = getKeyInRange(keys[0]);
        }

        if (matches[i].extraKeys) {
          // let extraKeys = [matches[i].extraKeys];
          // if (/.+[~-].+/.test(matches[i].extraKeys)) {
          //  keyBeenModified = true;
          //  extraKeys = getKeyInRange(matches[i].extraKeys);
          // }
          // keys = [...keys, ...extraKeys];
          keyBeenModified = true;
          keys = [...keys, matches[i].extraKeys.replaceAll(/[()]/g, "")];
        } else if (matches[i].extraRange) {
          keyBeenModified = true;
          const lastStart = keys[keys.length - 1];
          const keyInExtraRange = getKeyInRange(
            `${lastStart}~${matches[i].extraRange.replaceAll(/[()]/g, "")}`
          );

          if (keyInExtraRange.length > 1) {
            keys = [...keys.slice(0, -1), ...keyInExtraRange];
          } else {
            value = value.slice(0, value.match(/(至|到)/).index);
          }
        }
        keys =
          keys.length === 1 && keys[0] === ""
            ? keys
            : keys
                .filter((k) => k !== "")
                .filter((k) => !isKeyInReserve(k) && isKeyValid(k));
        keys = Array.from(new Set(keys));

        const start = matches[i].index;
        let end =
          matches[i].index + (keys.length === 0 ? item.length : value.length);

        const matchIndex = regExpsOrigin
          .map((o) => o.value)
          .indexOf(matches[i][1]);
        if (matchIndex >= 0) {
          // 元件名稱正確
          const keyErrorResults = checkKeyCorrect(
            item,
            keys,
            descriptionOfElementMap,
            figureOfDrawingsMap
          );
          if (keyErrorResults.some((arr) => !arr)) {
            // has key error
            let newValue = keyBeenModified
              ? `<i class="error e-${stringToUnicode(item)}">` + value + `</i>`
              : value.replace(
                  item,
                  `<i class="error e-${stringToUnicode(item)}">${item}</i>`
                );

            let lastIndex = newValue.length;
            for (let _iii = keyErrorResults.length - 1; _iii >= 0; _iii--) {
              if (!keyErrorResults[_iii]) {
                if (!keyBeenModified) {
                  const replacement = `<i class="error e-${stringToUnicode(
                    item
                  )}">${keys[_iii]}</i>`;
                  // let reg = `${keys[_iii]}([^${keys[_iii]}]*)$`;
                  // newValue = newValue.replace(RegExp(reg), replacement + '$1');  // replace from
                  const currentIndex = newValue
                    .slice(0, lastIndex)
                    .lastIndexOf(keys[_iii]);
                  newValue =
                    newValue.slice(0, currentIndex) +
                    newValue
                      .slice(currentIndex, lastIndex)
                      .replace(keys[_iii], replacement) +
                    newValue.slice(lastIndex);
                  lastIndex = currentIndex;
                }

                // Test
                // if (
                //   matches[i].index === 76 &&
                //   paragraph.startsWith("另一方面，紫外線光源")
                // ) {
                //   console.log(matches[i]);
                //   console.log(`value: ${value}`);
                //   console.log(`item: ${item}`);
                //   console.log(`keys: ${keys}`);
                //   console.log(`keyErrorResults: ${keyErrorResults}`);
                //   console.log(`_iii: ${_iii}`);
                //   console.log(`keys[_iii]: ${keys[_iii]}`);
                //   debugger;
                // }

                const wrongMatch = {
                  group: stringToUnicode(item),
                  item:
                    getMapValues(
                      descriptionOfElementMap,
                      figureOfDrawingsMap,
                      regExpsOrigin[matchIndex]
                    )?.values[0] || item,
                  value: item,
                  wrongKeys: [keys[_iii]]
                };
                if (
                  paragraphMatch.wrongs[0] &&
                  paragraphMatch.wrongs[0].group === wrongMatch.group &&
                  paragraphMatch.wrongs[0].item === wrongMatch.item &&
                  paragraphMatch.wrongs[0].value === wrongMatch.value
                ) {
                  paragraphMatch.wrongs[0] = {
                    ...wrongMatch,
                    wrongKeys: [
                      ...paragraphMatch.wrongs[0].wrongKeys,
                      ...wrongMatch.wrongKeys.filter(
                        (k) => !paragraphMatch.wrongs[0].wrongKeys.includes(k)
                      )
                    ]
                  };
                } else {
                  paragraphMatch.wrongs.unshift(wrongMatch);
                }

                // console.log("new Error been shifted");
                // console.log(paragraphMatch.wrongs[0]);
                // debugger;
              }
            }
            // console.log("best content: ", newValue);
            end = start + newValue.length;

            if (
              dataType !== "allAbstractParagraphDetails" &&
              dataType !== "allTechnicalFieldParagraphDetails" &&
              dataType !== "allBackgroundArtParagraphDetails"
            ) {
              paragraph = [
                paragraph.slice(0, start),
                paragraph.slice(start).replace(value, newValue)
              ].join("");
            }

            keys = keys.filter((_k, _ik) => keyErrorResults[_ik]);
            if (keys.length > 0) {
              paragraphMatch.corrects.unshift({
                group: stringToUnicode(
                  getMapValues(
                    descriptionOfElementMap,
                    figureOfDrawingsMap,
                    regExpsOrigin[matchIndex]
                  )?.values[0] || item
                ),
                value,
                item:
                  getMapValues(
                    descriptionOfElementMap,
                    figureOfDrawingsMap,
                    regExpsOrigin[matchIndex]
                  )?.values[0] || item,
                keys,
                start,
                end
              });
            }
          } else {
            // all keys are correct
            paragraphMatch.corrects.unshift({
              group: stringToUnicode(
                getMapValues(
                  descriptionOfElementMap,
                  figureOfDrawingsMap,
                  regExpsOrigin[matchIndex]
                )?.values[0] || item
              ),
              value,
              item:
                getMapValues(
                  descriptionOfElementMap,
                  figureOfDrawingsMap,
                  regExpsOrigin[matchIndex]
                )?.values[0] || item,
              keys,
              start,
              end
            });
          }

          // console.log(regExpsOrigin[matchIndex])
          paragraph = [
            paragraph.slice(0, end),
            `</span>`,
            paragraph.slice(end)
          ].join("");
          paragraph = [
            paragraph.slice(0, start),
            `<span class="c-${stringToUnicode(
              getMapValues(
                descriptionOfElementMap,
                figureOfDrawingsMap,
                regExpsOrigin[matchIndex]
              )?.values[0] || item
            )}">`,
            paragraph.slice(start)
          ].join("");
        } else {
          // 元件名稱錯誤
          if (
            keys.filter((kkk) => kkk !== "").length > 0 &&
            keys
              .filter((kkk) => kkk !== "")
              .every((kkkk) =>
                regExpsOrigin
                  .map((og) => og.key)
                  .find((ogkey) => ogkey === kkkk)
              )
          ) {
            // 元件符號錯誤且有符號 而且 該符號存在
            if (
              dataType !== "allAbstractParagraphDetails" &&
              dataType !== "allTechnicalFieldParagraphDetails" &&
              dataType !== "allBackgroundArtParagraphDetails"
            ) {
              paragraph = [
                paragraph.slice(0, end),
                `</i>`,
                paragraph.slice(end)
              ].join("");
              paragraph = [
                paragraph.slice(0, start),
                // `<i class="potentialError pe-${stringToUnicode(item)}">`,
                // 新版不管 potential Error
                // 元件錯就算 Error
                `<i class="error e-${stringToUnicode(item)}">`,
                paragraph.slice(start)
              ].join("");
            }

            paragraphMatch.wrongs.unshift({
              group: stringToUnicode(item),
              item,
              value: item,
              wrongKeys: keys
            });
          } else if (!RegExp(allSeperatedWords()).test(item)) {
            // 元件名稱錯誤且不包含「分隔字」,且沒有符號
            if (
              dataType !== "allAbstractParagraphDetails" &&
              dataType !== "allTechnicalFieldParagraphDetails" &&
              dataType !== "allBackgroundArtParagraphDetails"
            ) {
              paragraph = [
                paragraph.slice(0, end),
                `</i>`,
                paragraph.slice(end)
              ].join("");
              paragraph = [
                paragraph.slice(0, start),
                `<i class="potentialError pe-${stringToUnicode(item)}">`,
                paragraph.slice(start)
              ].join("");
            }

            // console.log(matches[i]);
            // debugger;

            const closestItem = findClosestItem(regExpsOrigin, item);
            paragraphMatch.potentialErrors.unshift({
              group: stringToUnicode(item),
              value,
              item: closestItem
                ? item + "：是否為「" + closestItem + "」"
                : item,
              keys,
              start,
              end
            });
          }
        }
      }

      // }
    } // for each match

    // put back tables if exist
    for (let j = tables.length - 1; j >= 0; j--) {
      paragraph = paragraph.replace(
        `@#%@table${j}table@#%@`,
        "<br/>" + tables[j]
      );
    }

    paragraphMatch.wrongs = paragraphMatch.wrongs.reduce((acc, cur) => {
      if (
        acc.find(
          (wrong) =>
            wrong.group === cur.group &&
            wrong.item === cur.item &&
            wrong.value === cur.value
        )
      ) {
        const prevIdx = acc.findIndex(
          (wrong) =>
            wrong.group === cur.group &&
            wrong.item === cur.item &&
            wrong.value === cur.value
        );
        acc[prevIdx] = {
          ...acc[prevIdx],
          wrongKeys: [
            ...acc[prevIdx].wrongKeys,
            ...cur.wrongKeys.filter((k) => !acc[prevIdx].wrongKeys.includes(k))
          ]
        };
        return acc;
      }
      return [...acc, cur];
    }, []);

    paragraphMatch.corrects.sort((a, b) => a.start - b.start);
    paragraphMatch.wrongs.sort((a, b) => a.start - b.start);
    paragraphMatch.potentialErrors.sort((a, b) => a.start - b.start);
    paragraphMatch.wrongWords.sort((a, b) => a.start - b.start);
    paragraphMatch.aboriginalWords.sort((a, b) => a.start - b.start);

    if (
      dataType === "allAbstractParagraphDetails" ||
      dataType === "allTechnicalFieldParagraphDetails" ||
      dataType === "allBackgroundArtParagraphDetails"
    ) {
      paragraphMatch.wrongs = [];
      paragraphMatch.potentialErrors = [];
    }

    // matchTableForAllParagraph.push(paragraphMatch);
    // modifiedParagraph.push({general, paragraph});
    // paragraphDetails = {
    //   general,
    //   content,  // old content
    //   paragraph,  // new content, being modified
    //   paragraphMatch: {
    //     corrects: [],
    //     wrongs: [],
    //     potentialErrors: [],
    //   }
    // }

    // if (paragraphMatch.wrongs.length > 0) {
    //   console.log("This paragraph has errors!");
    //   console.log(paragraphMatch.wrongs);
    //   debugger;
    // }

    return {
      isOK: true,
      general,
      content,
      modifiedParagraph: paragraph,
      tables,
      paragraphMatch,
      isCollapse: true
    };
  } catch (err) {
    console.log("here is why");
    console.log(err);
    return {
      isOK: false,
      general,
      content,
      modifiedParagraph: `<span class='error'>${content}</span>`,
      tables,
      paragraphMatch: {
        figures: [],
        figuresErrors: [],
        corrects: [],
        wrongs: [],
        potentialErrors: [],
        wrongWords: [],
        aboriginalWords: []
      },
      isCollapse: true
    };
  }
};

function findClosestItem(regExpsOrigin, item) {
  const wantedMatchChar = item.length - 1;
  return regExpsOrigin
    .map((o) => o.value)
    .filter((e) => e.length === item.length)
    .find((el) => {
      let matchCharCount = 0;
      for (let i = 0; i < el.length; i++) {
        if (el[i] === item[i]) {
          matchCharCount++;
        }
      }
      if (matchCharCount === wantedMatchChar) return true;
      return false;
    });
}

function hasDuplicateKey(key, item, descriptionOfElementMap) {
  return Object.keys(descriptionOfElementMap)
    .filter((k) => k.startsWith(`${key}_duplicate`))
    .some((k) => descriptionOfElementMap[k].values.includes(item));
}

function isKeyInMapValue(
  key,
  item,
  descriptionOfElementMap,
  figureOfDrawingsMap
) {
  if (
    descriptionOfElementMap[key] &&
    descriptionOfElementMap[key].values.includes(item)
  ) {
    return true;
  }

  if (
    figureOfDrawingsMap[key] &&
    figureOfDrawingsMap[key].values.includes(item)
  ) {
    return true;
  }

  return false;
}

function trimFig(fig) {
  if (!/^[0-9]+[a-z]$/.test(fig)) return fig;

  const alphabetMatch = fig.match(/[a-z]$/);

  return fig.slice(0, alphabetMatch.index) + "\\(?" + alphabetMatch[0];
}
