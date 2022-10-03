import { stringToUnicode } from "./stringToUnicode";
import {
  checkAlphabetRangeCorrect,
  extractElement,
  lastTryToParseElements,
  modifyValue,
  handleMultipleValues,
  extractElement_v2
} from "./otherUtils";
import {
  isKeyValid,
  keyEndMatch,
  keyStartMatch,
  allSymbolChar
} from "../dict/keyRegs";

export const processData = (
  data,
  method,
  essentialData,
  oldElements,
  payload
) => {
  try {
    tryProcessData(data, method, essentialData, oldElements, payload);
  } catch (error) {
    if (method === "description-of-element") {
      essentialData.descriptionOfElementMap = { parse_failed: true };
    } else {
      essentialData.figureOfDrawingsMap = { parse_failed: true };
    }
  }
};

const tryProcessData = (data, method, essentialData, oldElements, payload) => {
  // // if we've extracted elements before, use the old ones

  if (oldElements && method === "description-of-element") {
    essentialData.descriptionOfElementMap = Object.keys(oldElements).reduce(
      (acc, objKey) => {
        const { values, status } = oldElements[objKey];
        acc[objKey] =
          status === "key duplicate"
            ? { values, status }
            : {
                id: stringToUnicode(values[0]),
                values,
                isUsed: false // default is false
              };
        return acc;
      },
      {}
    );
    return;
  } else if (oldElements && method === "figure-drawings") {
    essentialData.figureOfDrawingsMap = Object.keys(oldElements).reduce(
      (acc, objKey) => {
        const { values, status } = oldElements[objKey];
        acc[objKey] =
          status === "key duplicate"
            ? { values, status }
            : {
                id: stringToUnicode(values[0]),
                values,
                status: "Not in description of element" // Default status
              };
        return acc;
      },
      {}
    );
    return;
  }

  // if we don't have old elements, extract the elements
  let keyAndValueArr = [];
  let newElements;
  let tmpFailedDescriptionOfElementMap = [];
  let tmpFailedFigureOfDrawingsMap = [];
  // if we've extracted elements before, use the old ones
  if (
    payload &&
    (method === "description-of-element" || method === "figure-drawings")
  ) {
    newElements = payload;
  } else {
    // newElements = extractElement(data.children, []);

    /*
    newElements = extractElement_v2(data)
      .split("@##@")
      .filter((p) => p !== "");
    console.log("newElements");
    console.log(newElements);
    debugger;
    */

    //  newElements = extractElement(data)
    //   .filter((ele) => ele !== "##br##")
    //   .filter((ele) => ele !== "")
    newElements = extractElement_v2(data)
      .split("@##@")
      .filter((p) => p !== "")
      .map((ele, eleIdx) => ({
        num: eleIdx,
        el: ele.replace(/[↵\n]/g, "").trim()
      }))
      .map((ele, eleIdx) => ({
        ...ele,
        el: /[；。，、;,'.]$/.test(ele.el) ? ele.el.slice(0, -1) : ele.el
      }));
    // Test
    // if (method === "description-of-element") {
    //   console.log(newElements);
    //   debugger;
    // }
  }

  if (
    newElements.length === 1 &&
    newElements[0].el.split(/[\s、; ; ，]+/).length > 1 &&
    (newElements[0].el
      .split(/[\s、; ; ，]+/)
      .every((ee) => !!keyStartMatch(ee.replace(/[↵\n]/g, "").trim())) ||
      newElements[0].el
        .split(/[\s、; ; ，]+/)
        .every((ee) => !!keyEndMatch(ee.replace(/[↵\n]/g, "").trim())))
  ) {
    /*
      全寫在同一行 ex: 打氣設備1、殼體10、容置空間100、第一殼101...
    */
    if (
      newElements[0].el
        .split(/[\s、; ; ，]+/)
        .every((ee) => !!keyStartMatch(ee.replace(/[↵\n]/g, "").trim()))
    ) {
      newElements[0].el.split(/[\s、; ; ，]+/).forEach((ee, eeIdx) => {
        const theEl = ee.replace(/[↵\n]/g, "").trim();
        // const key = theEl.match(/^[θa-z0-9']+/i)[0];
        const key = keyStartMatch(theEl)[0];
        const value = modifyValue(theEl.slice(key.length));
        keyAndValueArr.push({ key, value, num: eeIdx });
      });
    } else {
      newElements[0].el.split(/[\s、; ; ，]+/).forEach((ee, eeIdx) => {
        const theEl = ee.replace(/[↵\n]/g, "").trim();
        // const key = theEl.match(/[θa-z0-9']+$/i)[0];
        const key = keyEndMatch(theEl)[0];
        const value = modifyValue(theEl.slice(0, theEl.length - key.length));
        keyAndValueArr.push({ key, value, num: eeIdx });
      });
    }
  } else if (
    newElements.every(
      ({ el }) =>
        el
          .replace(/[↵\n]/g, "")
          .trim()
          .split(/[\s; ;：:，.‧]+/).length === 1
    ) &&
    (newElements.every(
      ({ el }) => !!keyStartMatch(el.replace(/[↵\n]/, "").trim())
    ) ||
      newElements.every(
        ({ el }) => !!keyEndMatch(el.replace(/[↵\n]/g, "").trim())
      ))
  ) {
    /*
      元件和符號沒有空格: ex: 10充電座
    */
    if (
      newElements.every(
        ({ el }) => !!keyStartMatch(el.replace(/[↵\n]/g, "").trim())
      )
    ) {
      newElements.forEach(({ el, num }) => {
        const theEl = el.replace(/[↵\n]/g, "").trim();
        // const key = theEl.match(/^[θa-z0-9']+/i)[0];
        const key = keyStartMatch(theEl)[0];
        const value = modifyValue(theEl.slice(key.length));
        keyAndValueArr.push({ key, value, num });
      });
    } else {
      newElements.forEach(({ el, num }) => {
        const theEl = el.replace(/[↵\n]/g, "").trim();
        // const key = theEl.match(/[θa-z0-9']+$/i)[0];
        const key = keyEndMatch(theEl)[0];
        const value = modifyValue(theEl.slice(0, theEl.length - key.length));
        keyAndValueArr.push({ key, value, num });
      });
    }
  } else {
    /*
      用冒號「:」或逗號「，」或「.」來區分或空白格來分開符號與元件名稱
    */
    // console.log("we are here");
    // console.log(newElements);
    // debugger;

    newElements.forEach(({ num, el }) => {
      try {
        if (!/.*[：；;:、\-.‧\s]+.*/.test(el.replace(/[↵\n]/g, "").trim())) {
          // console.log("invalid form:");
          // console.log(el);
          // debugger;
          lastTryToParseElements(
            el.replace(/[↵\n]/g, "").trim()
          ).forEach(({ key, value }) =>
            keyAndValueArr.push({ key, value, num })
          );
        } else {
          let newEl = el
            .replace(/[↵\n]/g, "")
            .trim()
            .replaceAll(/([.‧·\-…·]{2,})/g, " ");
          // let keyAndValue = newEl.split(/[；;:：，.‧·]+/);
          let keyAndValue = newEl.split(/[；;:：，]+/);
          // console.log(keyAndValue);
          if (keyAndValue.length === 2) {
            // 用冒號「:」或逗號「，」或「.」來分開符號與元件名稱
            if (
              keyAndValue[0].trim().length > 0 &&
              isKeyValid(keyAndValue[0].replaceAll(/[()\s]/g, "").trim())
            ) {
              keyAndValueArr.push({
                key: keyAndValue[0].replaceAll(/[()\s]/g, "").trim(),
                value: modifyValue(keyAndValue[1].trim()),
                num
              });
            } else if (
              keyAndValue[1].trim().length > 0 &&
              isKeyValid(keyAndValue[1].replaceAll(/[()\s]/g, "").trim())
            ) {
              keyAndValueArr.push({
                key: keyAndValue[1].replaceAll(/[()\s]/g, "").trim(),
                value: modifyValue(keyAndValue[0].trim()),
                num
              });
            } else {
              // console.log(el);
              // debugger;
              lastTryToParseElements(
                el.replace(/[↵\n]/g, "").trim()
              ).forEach(({ key, value }) =>
                keyAndValueArr.push({ key, value, num })
              );
            }
          } else {
            // 若失敗，用空白格來分開符號與元件名稱
            keyAndValue = keyAndValue[0].split(/[\s]+/);
            if (keyAndValue.length !== 2) {
              lastTryToParseElements(
                el.replace(/[↵\n]/g, "").trim()
              ).forEach(({ key, value }) =>
                keyAndValueArr.push({ key, value, num })
              );
            } else if (
              keyAndValue[0].trim().length > 0 &&
              isKeyValid(keyAndValue[0].replaceAll(/[()\s]/g, "").trim())
            ) {
              keyAndValueArr.push({
                key: keyAndValue[0].replaceAll(/[()\s]/g, "").trim(),
                value: modifyValue(keyAndValue[1].trim()),
                num
              });
            } else if (
              keyAndValue[1].trim().length > 0 &&
              isKeyValid(keyAndValue[1].replaceAll(/[()\s]/g, "").trim())
            ) {
              keyAndValueArr.push({
                key: keyAndValue[1].replaceAll(/[()\s]/g, "").trim(),
                value: modifyValue(keyAndValue[0].trim()),
                num
              });
            } else {
              // console.log("this one failed");
              // console.log(keyAndValue);
              // console.log(el.replace(/[↵\n]/, "").trim());
              // debugger;
              lastTryToParseElements(
                el.replace(/[↵\n]/g, "").trim()
              ).forEach(({ key, value }) =>
                keyAndValueArr.push({ key, value, num })
              );
            }
          }
        }
      } catch (err) {
        if (
          /創作|新型|發明|習知|習用|現有/.test(el.replace(/[↵\n]/g, "").trim())
        ) {
          return;
        }
        if (/\[[0-9]+\]/.test(el.replace(/[↵\n]/g, "").trim())) {
          return;
        }

        // console.log(el);
        // debugger;

        if (method === "description-of-element") {
          tmpFailedDescriptionOfElementMap.push({
            num,
            el: el.replace(/[↵\n]/g, "").trim()
          });
        } else {
          tmpFailedFigureOfDrawingsMap.push({
            num,
            el: el.replace(/[↵\n]/g, "").trim()
          });
        }
      }
    });
  }

  let dpCount = 1;
  let keyAndValueMap = {};
  keyAndValueArr.forEach((el) => {
    try {
      const keys = el.key.replaceAll(/[()\s]/g, "").split(/[,、]/);
      if (el.value === "") {
        // 有 key 沒有 value
        throw new Error(`${keys}!@#$%${el.num}`);
      }
      const values = handleMultipleValues(el.value);
      // el.value.split(/[/,()（）]/).length === 1
      //   ? [el.value]
      //   : [
      //       el.value,
      //       ...el.value
      //         .split(/[/,()（）]/)
      //         .filter((value) => value.trim().length > 0)
      //         .map((value) => value.trim())
      //     ];
      let keyRange = [];
      keys.forEach((k) => {
        k = k.trim();
        try {
          if (/.+[~～-].+/.test(k)) {
            keyRange = [k];
            let beginKey = k.split(/[~～-]/)[0].trim();
            let endKey = k.split(/[~～-]/)[1].trim();
            let beginWithPlum = false;
            let endWithPlum = false;
            // e.g. S1'~S2'
            if (/'$/.test(beginKey)) {
              beginKey = beginKey.slice(0, beginKey.length - 1);
              beginWithPlum = true;
            }
            if (/'$/.test(endKey)) {
              endKey = endKey.slice(0, endKey.length - 1);
              endWithPlum = true;
            }
            if (beginWithPlum !== endWithPlum) {
              throw Error("I don't understand");
            }
            if (checkAlphabetRangeCorrect(beginKey, endKey)) {
              // e.g. A~～D, a~～d, 100A~～100C
              const startNum = beginKey.match(/^[0-9]*/)[0];
              const beginAlphabetCharCode = beginKey.charCodeAt(
                beginKey.length - 1
              );
              const endAlphabetCharCode = endKey.charCodeAt(
                beginKey.length - 1
              );
              if (beginAlphabetCharCode >= endAlphabetCharCode) {
                throw Error("I don't understand");
              }
              for (
                let i = beginAlphabetCharCode;
                i <= endAlphabetCharCode;
                i++
              ) {
                keyRange.push(
                  startNum +
                    String.fromCharCode(i) +
                    (beginWithPlum && endWithPlum ? `'` : "")
                );
              }
              keyRange.shift();
            } else {
              // e.g. S1~～S5
              const beginIndex = parseInt(beginKey.match(/[0-9]+$/)[0]);
              const endIndex = parseInt(endKey.match(/[0-9]+$/)[0]);
              if (beginIndex >= endIndex) {
                throw Error("It's just symbol");
              }
              for (let i = beginIndex; i <= endIndex; i++) {
                const replacement = i;
                let reg = `${beginIndex}([^${beginIndex}]*)$`;
                keyRange.push(
                  beginKey.replace(RegExp(reg), replacement + "$1") +
                    (beginWithPlum && endWithPlum ? `'` : "")
                );
              }
              keyRange.shift();
            }
          } else {
            keyRange = [k];
          }
        } catch (e) {
          keyRange = [k];
        }

        // console.log("keyRange");
        // console.log(keyRange);

        keyRange.forEach((kk) => {
          if (
            !RegExp(
              `^[${allSymbolChar}']*[-~～]?[${allSymbolChar}']*$`,
              "i"
            ).test(kk)
          ) {
            if (method === "description-of-element") {
              tmpFailedDescriptionOfElementMap.push({
                // num: -1 * (Math.floor(Math.random() * 10000) + 10000),
                num: el.num,
                el: el.value
              });
            } else {
              tmpFailedFigureOfDrawingsMap.push({
                // num: -1 * (Math.floor(Math.random() * 10000) + 10000),
                num: el.num,
                el: el.value
              });
            }
            return;
          } else if (keyAndValueMap[kk] !== undefined) {
            // 同個符號出現2次以上
            keyAndValueMap[`${kk}_duplicate_${dpCount}`] = {
              values,
              status: "key duplicate"
            };
            dpCount++;
            return;
          }
          keyAndValueMap[kk] =
            method === "description-of-element"
              ? {
                  id: stringToUnicode(values[0]),
                  values,
                  isUsed: false // default is false
                }
              : {
                  id: stringToUnicode(values[0]),
                  values,
                  status: "Not in description of element" // Default status
                };
        });
      });
    } catch (error) {
      // 符號為 "" 的情況
      if (method === "description-of-element") {
        tmpFailedDescriptionOfElementMap.push({
          // num: -1 * (Math.floor(Math.random() * 10000) + 10000),
          num: parseInt(error.message.split("!@#$%")[1]),
          el: error.message.split("!@#$%")[0]
        });
      } else {
        tmpFailedFigureOfDrawingsMap.push({
          // num: -1 * (Math.floor(Math.random() * 10000) + 10000),
          num: parseInt(error.message.split("!@#$%")[1]),
          el: error.message.split("!@#$%")[0]
        });
      }
    }
  });

  if (method === "description-of-element") {
    // console.log("keyAndValueMap: ", keyAndValueMap);
    // console.log(
    //   "tmpFailedDescriptionOfElementMap:",
    //   tmpFailedDescriptionOfElementMap
    // );
    // debugger;
    essentialData.descriptionOfElementMap = keyAndValueMap;
    essentialData.failedDescriptionOfElementMap = tmpFailedDescriptionOfElementMap.sort();
  } else {
    essentialData.figureOfDrawingsMap = keyAndValueMap;
    essentialData.failedFigureOfDrawingsMap = tmpFailedFigureOfDrawingsMap.sort();
  }

  // console.log("my Essentials");
  // console.log(essentialData.descriptionOfElementMap);
};
