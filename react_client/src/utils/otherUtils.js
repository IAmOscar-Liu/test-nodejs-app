import { isKeyValid, keyEndMatch, keyStartMatch } from "../dict/keyRegs";
import { reserveKey } from "../dict/reserveKey";
import { extractTableElement_v2 } from "./extractTableElement";

export const isChineseCharKey = (key) => {
  if (key === "") return false;
  for (let i = 0; i < key.length; i++) {
    if (!/[一二三四五六七八九十]/.test(key[i])) return false;
  }
  return true;
};

export const chineseCharKey2NumKey = (key) => {
  const chinese2Num = (ch) => {
    if (ch === "") return 0;
    switch (ch) {
      case "十":
        return 0;
      case "一":
        return 1;
      case "二":
        return 2;
      case "三":
        return 3;
      case "四":
        return 4;
      case "五":
        return 5;
      case "六":
        return 6;
      case "七":
        return 7;
      case "八":
        return 8;
      case "九":
        return 9;
      default:
        return 0;
    }
  };

  if (key === "十") return 10;
  if (key.length === 2 && /^十[一二三四五六七八九]/.test(key))
    return 10 + chinese2Num(key[1]);
  if (key.length === 2 && /^[一二三四五六七八九]十/.test(key))
    return 10 * chinese2Num(key[0]);
  if (key.length === 3 && /^[一二三四五六七八九]十/.test(key))
    return 10 * chinese2Num(key[0]) + chinese2Num(key[2]);

  let keyNum = "";
  for (let k of key) {
    keyNum += chinese2Num(k);
  }
  return parseInt(keyNum);
};

export const numKey2ChineseCharKey = (key) => {
  const num2Chinese = (num) => {
    if (num === "") return "";
    switch (num) {
      case "0":
        return "十";
      case "1":
        return "一";
      case "2":
        return "二";
      case "3":
        return "三";
      case "4":
        return "四";
      case "5":
        return "五";
      case "6":
        return "六";
      case "7":
        return "七";
      case "8":
        return "八";
      case "9":
        return "九";
      default:
        return "";
    }
  };

  if (key === 10) return "十";
  if (key > 10 && key < 20) return "十" + num2Chinese(key - 10 + "");
  if (key > 10 && key % 10 === 0) return num2Chinese(key / 10 + "") + "十";
  if (key > 10 && key < 100)
    return (
      num2Chinese(Math.floor(key / 10) + "") +
      "十" +
      num2Chinese((key % 10) + "")
    );

  const strKey = key + "";
  let keys = "";
  for (let k of strKey) {
    keys += num2Chinese(k);
  }
  return keys;
};

export const getChineseKeyInRange = (
  chineseCharBeginKey,
  chineseCharEndKey
) => {
  const keyRange = [];
  let beginKey = chineseCharKey2NumKey(chineseCharBeginKey);
  let endKey = chineseCharKey2NumKey(chineseCharEndKey);

  if (beginKey >= endKey) throw new Error("I don't understand");

  for (let i = beginKey; i <= endKey; i++) {
    keyRange.push(numKey2ChineseCharKey(i));
  }
  return keyRange;
};

export const getKeyInRange = (k, isFig = false) => {
  k = k.trim();
  let keyRange;
  try {
    keyRange = [];
    let beginKey = k.split(/[-~～到至]/)[0].trim();
    let endKey = k.split(/[-~～到至]/)[1].trim();

    if (isFig && isChineseCharKey(beginKey) && isChineseCharKey(endKey)) {
      return getChineseKeyInRange(beginKey, endKey);
    }

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
      // e.g. A~D, a~d, 100A~100C
      const startNum = beginKey.match(/^[0-9]*/)[0];
      const beginAlphabetCharCode = beginKey.charCodeAt(beginKey.length - 1);
      const endAlphabetCharCode = endKey.charCodeAt(beginKey.length - 1);
      if (beginAlphabetCharCode >= endAlphabetCharCode) {
        throw Error("I don't understand");
      }
      for (let i = beginAlphabetCharCode; i <= endAlphabetCharCode; i++) {
        keyRange.push(
          startNum +
            String.fromCharCode(i) +
            (beginWithPlum && endWithPlum ? `'` : "")
        );
      }
    } else {
      // e.g. S1~S5
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
    }
  } catch (e) {
    keyRange = [k];
  }
  return keyRange;
};

export const checkAlphabetRangeCorrect = (beginKey, endKey) => {
  // e.g. A~～D, a~～d, 100A~～100C
  if (!/[0-9]*[a-z]+$/i.test(beginKey) || !/[0-9]*[a-z]+$/i.test(endKey)) {
    return false;
  }

  // should have only one alphabet
  if (
    beginKey.match(/[a-z]+$/i)[0].length !== 1 ||
    endKey.match(/[a-z]+$/i)[0].length !== 1
  ) {
    return false;
  }

  // the number part should be the same
  if (
    !(
      beginKey.match(/^[0-9]*/)[0] === endKey.match(/^[0-9]*/)[0] ||
      (beginKey.match(/^[0-9]*/)[0] !== "" && endKey.match(/^[0-9]*/)[0] === "")
    )
  ) {
    return false;
  }

  // check if begin alphabet and end alphabet are all uppercase or lowercase
  const beginAlphabet = beginKey.match(/[a-z]+$/i);
  const endAlphabet = endKey.match(/[a-z]+$/i);
  if (
    (/[A-Z]/.test(beginAlphabet) && /[A-Z]/.test(endAlphabet)) ||
    (/[a-z]/.test(beginAlphabet) && /[a-z]/.test(endAlphabet))
  ) {
    return true;
  }
  return false;
};

export const modifyValue = (values) => {
  return values
    .split("/")
    .filter((value) => value !== "")
    .map((value) => {
      if (/^[、．·.‧\-~～…:：]+/.test(value)) {
        return value.slice(value.match(/^[、．·.‧\-~～…:：]+/)[0].length);
      }
      if (/[、．·.‧\-~～…:：]+$/.test(value)) {
        return value.slice(0, value.match(/[、．·.‧\-~～…:：]+$/).index);
      }
      return value;
    })
    .join("/");
};

export const lastTryToParseElements = (_element) => {
  let element = _element.replaceAll(/([·.‧\-…]{2,})/g, " ");
  let allKeysAndValues = element.split(/[\s：:，.‧…]+/);

  // console.log(element);
  // console.log(allKeysAndValues);
  // debugger;

  // Test
  // if (
  //   element ===
  //   "(122a)防塵蓋                (20) 保溫裝置             (21) 充電電池"
  // ) {
  //   console.log(element);
  //   console.log(allKeysAndValues);
  //   debugger;
  // }

  if (
    allKeysAndValues.length === 1 &&
    (keyStartMatch(element) || keyEndMatch(element))
  ) {
    if (keyStartMatch(element)) {
      // const key = element.match(/^[θa-z0-9',、]+/i)[0];
      const key = keyStartMatch(element)[0];
      const value = modifyValue(element.slice(key.length));
      return [{ key, value }];
    } else {
      // const key = element.match(/[θa-z0-9',、]+$/i)[0];
      const key = keyEndMatch(element)[0];
      const value = modifyValue(element.slice(0, element.length - key.length));
      return [{ key, value }];
    }
  } else if (
    allKeysAndValues.length === 2 &&
    (allKeysAndValues[0].split(/[,、]/).every((kk) => isKeyValid(kk)) ||
      allKeysAndValues[1].split(/[,、]/).every((kk) => isKeyValid(kk)))
  ) {
    // 步驟流程：S101-S118、S201-S207、S301-S309、S401-S407、S501-S504、S601-S607、S701-S707
    if (allKeysAndValues[0].split(/[,、]/).every((kk) => isKeyValid(kk))) {
      return allKeysAndValues[0]
        .split(/[,、]/)
        .map((kk) => ({ key: kk, value: allKeysAndValues[1] }));
    } else {
      return allKeysAndValues[1]
        .split(/[,、]/)
        .map((kk) => ({ key: kk, value: allKeysAndValues[0] }));
    }
  }

  // else if (
  //   allKeysAndValues.length % 2 === 1 ||
  //   allKeysAndValues.length === 0
  // ) {
  //   throw Error("Fail to parse this one");
  // }

  let allKeysAndValuePairs = [];

  if (
    allKeysAndValues.length % 2 === 0 &&
    allKeysAndValues.filter((_, idx) => idx % 2 === 0).length > 0 &&
    allKeysAndValues
      .filter((_, idx) => idx % 2 === 0)
      .every(
        (el) =>
          el.trim().length > 0 && isKeyValid(el.replaceAll(/[()]/g, "").trim())
      )
  ) {
    allKeysAndValues.forEach((kk, idx) => {
      if (idx % 2 === 0) {
        allKeysAndValuePairs.push({
          key: kk.replaceAll(/[()]/g, "").trim(),
          value: modifyValue(allKeysAndValues[idx + 1])
        });
      }
    });
    return allKeysAndValuePairs;
  } else if (
    allKeysAndValues.length % 2 === 0 &&
    allKeysAndValues.filter((_, idx) => idx % 2 === 1).length > 0 &&
    allKeysAndValues
      .filter((_, idx) => idx % 2 === 1)
      .every(
        (el) =>
          el.trim().length > 0 && isKeyValid(el.replaceAll(/[()]/g, "").trim())
      )
  ) {
    allKeysAndValues.forEach((kk, idx) => {
      if (idx % 2 === 1) {
        allKeysAndValuePairs.push({
          key: kk.replaceAll(/[()]/g, "").trim(),
          value: modifyValue(allKeysAndValues[idx - 1])
        });
      }
    });
    return allKeysAndValuePairs;
  }

  //replace(/[↵\n]/g, "").trim()

  if (
    allKeysAndValues.every(
      (ka) =>
        keyStartMatch(ka.replace(/[↵\n]/g, "").trim()) ||
        keyEndMatch(ka.replace(/[↵\n]/g, "").trim())
    )
  ) {
    // 100元件  120連接器 (同一行沒有用空格隔開)
    let newAllKeysAndValues = [];
    allKeysAndValues.forEach((ka) => {
      if (keyStartMatch(ka.replace(/[↵\n]/g, "").trim())) {
        const theEl = ka.replace(/[↵\n]/g, "").trim();
        // const key = theEl.match(/^[θa-z0-9',、]+/i)[0];
        const key = keyStartMatch(theEl)[0];
        const value = modifyValue(theEl.slice(key.length));
        newAllKeysAndValues.push({ key, value });
      } else {
        const theEl = ka.replace(/[↵\n]/g, "").trim();
        // const key = theEl.match(/[θa-z0-9',、]+$/i)[0];
        const key = keyEndMatch(theEl)[0];
        const value = modifyValue(theEl.slice(0, theEl.length - key.length));
        newAllKeysAndValues.push({ key, value });
      }
    });
    return newAllKeysAndValues;
  } else if (
    (isKeyValid(allKeysAndValues[0].replace(/[↵\n]/g, "").trim()) &&
      !allKeysAndValues
        .slice(1)
        .some(
          (ka) =>
            isKeyValid(ka.replace(/[↵\n]/g, "").trim()) ||
            keyStartMatch(ka.replace(/[↵\n]/g, "").trim()) ||
            keyEndMatch(ka.replace(/[↵\n]/g, "").trim())
        )) ||
    (isKeyValid(
      allKeysAndValues[allKeysAndValues.length - 1].replace(/[↵\n]/g, "").trim()
    ) &&
      !allKeysAndValues
        .slice(0, -1)
        .some(
          (ka) =>
            isKeyValid(ka.replace(/[↵\n]/g, "").trim()) ||
            keyStartMatch(ka.replace(/[↵\n]/g, "").trim()) ||
            keyEndMatch(ka.replace(/[↵\n]/g, "").trim())
        ))
  ) {
    // 1900：你好嗎，我很好 (元件有逗號)
    if (
      isKeyValid(allKeysAndValues[0].replace(/[↵\n]/g, "").trim()) &&
      !allKeysAndValues
        .slice(1)
        .some(
          (ka) =>
            isKeyValid(ka.replace(/[↵\n]/g, "").trim()) ||
            keyStartMatch(ka.replace(/[↵\n]/g, "").trim()) ||
            keyEndMatch(ka.replace(/[↵\n]/g, "").trim())
        )
    ) {
      const key = allKeysAndValues[0].replace(/[↵\n]/g, "").trim();
      const firstMatchDivider = element.match(/[\s：:，.‧…]+/);
      const value = element
        .slice(firstMatchDivider.index + firstMatchDivider[0].length)
        .trim();
      return [{ key, value: modifyValue(value) }];
    } else {
      const key = allKeysAndValues[allKeysAndValues.length - 1]
        .replace(/[↵\n]/g, "")
        .trim();
      const lastMatchDivider = [...element.matchAll(/[\s：:，.‧…]+/gi)].pop();
      const value = element.slice(
        0,
        lastMatchDivider.index + lastMatchDivider[0].length
      );
      return [{ key, value: modifyValue(value) }];
    }
  } else if (
    allKeysAndValues.some(
      (ka) =>
        isKeyValid(ka.replace(/[↵\n]/g, "").trim()) ||
        keyStartMatch(ka.replace(/[↵\n]/g, "").trim()) ||
        keyEndMatch(ka.replace(/[↵\n]/g, "").trim())
    )
  ) {
    // 2000：你好  2001我很好 (不規則，有的符號和元件有隔開有的沒有)
    let copyAllKeysAndValues = allKeysAndValues.slice();
    let tmpAllKeysAndValuesPairs = [];
    while (copyAllKeysAndValues.length > 0) {
      if (
        isKeyValid(copyAllKeysAndValues[0]) &&
        copyAllKeysAndValues[1] &&
        !isKeyValid(copyAllKeysAndValues[1]) &&
        !keyStartMatch(copyAllKeysAndValues[1]) &&
        !keyEndMatch(copyAllKeysAndValues[1])
      ) {
        tmpAllKeysAndValuesPairs.push({
          key: copyAllKeysAndValues.shift(),
          value: copyAllKeysAndValues.shift()
        });
      } else if (
        copyAllKeysAndValues[1] &&
        isKeyValid(copyAllKeysAndValues[1]) &&
        !isKeyValid(copyAllKeysAndValues[0]) &&
        !keyStartMatch(copyAllKeysAndValues[0]) &&
        !keyEndMatch(copyAllKeysAndValues[0])
      ) {
        tmpAllKeysAndValuesPairs.push({
          value: copyAllKeysAndValues.shift(),
          key: copyAllKeysAndValues.shift()
        });
      } else if (keyStartMatch(copyAllKeysAndValues[0])) {
        const theEl = copyAllKeysAndValues.shift();
        const key = keyStartMatch(theEl)[0];
        const value = modifyValue(theEl.slice(key.length));
        tmpAllKeysAndValuesPairs.push({ key, value });
      } else if (keyEndMatch(copyAllKeysAndValues[0])) {
        const theEl = copyAllKeysAndValues.shift();
        const key = keyEndMatch(theEl)[0];
        const value = modifyValue(theEl.slice(0, theEl.length - key.length));
        tmpAllKeysAndValuesPairs.push({ key, value });
      } else {
        throw Error("Fail to parse this one");
      }
    } // while
    return tmpAllKeysAndValuesPairs;
  }

  throw Error("Fail to parse this one");
};

// export const extractElement = (myElements, newElements) => {
//   if (myElements && myElements.length === 0) {
//     return newElements;
//   }

//   for (let i = 0; i < myElements.length; i++) {
//     if (myElements[i].value === "" && myElements[i].children.length === 0) {
//       continue;
//     }

//     if (myElements[i].type === "text" && myElements[i].value.length > 0) {
//       newElements.push({
//         num: newElements.length,
//         el: myElements[i].value.replace(/[↵\n]/g, "").trim()
//       });
//     } else if (
//       myElements[i].children.find(
//         (el) =>
//           (el.name === "sub" || el.name === "sup") &&
//           el.value === "" &&
//           el.children.length > 0 &&
//           el.children[0].value.length > 0
//       ) &&
//       myElements[i].children.find((el) => el.name === "br" && el.value === "")
//     ) {
//       const indexOfBr = myElements[i].children.reduce(
//         (a, e, i) => {
//           if (e.name === "br" && e.value === "") {
//             a.push(i);
//           }
//           return a;
//         },
//         [-1]
//       ); // ex [-1,5,10]

//       const myElementsChildren = myElements[i].children;

//       indexOfBr.forEach((el, index) => {
//         const endIndex =
//           indexOfBr[index + 1] !== undefined
//             ? indexOfBr[index + 1]
//             : myElementsChildren.length;

//         const myElementsSection = myElementsChildren.slice(el + 1, endIndex);
//         let newCombinedValue = "";
//         myElementsSection.forEach((myEl) => {
//           if (myEl.type === "text" && myEl.value.length > 0) {
//             newCombinedValue += myEl.value.replace(/[↵\n]/g, "");
//           } else if (myEl.name === "sub" || myEl.name === "sup") {
//             newCombinedValue += myEl.children[0].value.replace(/[↵\n]/g, "").trim();
//           }
//         });
//         newElements.push({
//           num: newElements.length,
//           el: newCombinedValue.replace(/[↵\n]/g, "").trim()
//         });
//         // console.log(arrSection);
//       });
//     } else if (myElements[i].children.length > 0) {
//       const oldElements = newElements.splice();
//       const newAddedElements = extractElement(
//         myElements[i].children,
//         newElements
//       );
//       newElements = [...oldElements, ...newAddedElements];
//     }
//   } // for
//   return newElements;
// };

export const extractElement = (myElements) => {
  // console.log("inside extractElement");
  // console.log(myElements);

  // debugger;

  if (myElements.type === "text" && myElements.value !== "") {
    return [myElements.value.replaceAll(/[()]/g, "").trim()];
  }

  if (myElements.name === "br" && myElements.type === "element") {
    return ["##br##"];
  }

  if (myElements.name === "table" && myElements.type === "element") {
    return [extractTableElement_v2(myElements)];
  }

  let allElements = [];
  let copyOfChildren = [...myElements.children];
  while (copyOfChildren.length > 0) {
    const child = copyOfChildren[0];
    const nextChild = copyOfChildren[1];
    const nextNextChild = copyOfChildren[2];

    if (
      child.type === "text" &&
      child.value !== "" &&
      nextChild &&
      (nextChild.name === "sup" || nextChild.name === "sub") &&
      nextChild.type === "element"
    ) {
      // if we have sth like A<sup>1</sup>
      if (
        nextNextChild &&
        nextNextChild.type === "text" &&
        nextNextChild.value !== ""
      ) {
        // Test
        // console.log(copyOfChildren);
        // debugger;

        const eachChildResult = [
          copyOfChildren.shift().value.replaceAll(/[()]/g, "").trim(),
          ...extractElement(copyOfChildren.shift()),
          copyOfChildren.shift().value.replaceAll(/[()]/g, "").trim()
        ];
        allElements.push(eachChildResult.join(""));
      } else {
        const eachChildResult = [
          copyOfChildren.shift().value.replaceAll(/[()]/g, "").trim(),
          ...extractElement(copyOfChildren.shift())
        ];
        allElements.push(eachChildResult.join(""));
      }
    } else {
      const eachChildResult = extractElement(copyOfChildren.shift());
      allElements.push(...eachChildResult);
    }

    // let eachChild = extractElement(child);
    // allElements.push(eachChild.shift());

    // while (eachChild.length > 0) {
    //   allElements.push("##separat##");
    //   allElements.push(eachChild.shift());
    // }
    // allElements.push(...eachChild);
  }

  // return type ["元件1", "元件2", ...]
  return allElements;
};

export const extractElement_v2 = (element) => {
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
      descriptionStr += "@##@" + extractElement_v2(child);
    } else {
      descriptionStr += extractElement_v2(child);
    }
  });
  return descriptionStr;
};

export const handleMultipleValues = (value) => {
  // el.value.split(/[/,()（）]/).length === 1
  //         ? [el.value]
  //         : [
  //             el.value,
  //             ...el.value
  //               .split(/[/,()（）]/)
  //               .filter((value) => value.trim().length > 0)
  //               .map((value) => value.trim())
  //           ];
  if (value.split(/[/,()（）]/).length === 1) {
    return [value];
  }

  const values = [
    value,
    ...value
      .split(/[/,()（）]/)
      .filter((v) => v.trim().length > 0)
      .map((v) => v.trim())
  ];

  // e.g. 通訊模組/傳輸模組/接收模組
  if (
    values.slice(1).every((v) => v.length === values[1].length) ||
    values.slice(1).every((v) => v.slice(-1) === values[1].slice(-1))
  ) {
    return values;
  }

  // e.g. 通訊/傳輸/接收模組
  if (
    values.slice(1, -1).every((v) => v.length === values[1].length) &&
    values
      .slice(1, -1)
      .every((v) => v.length < values[values.length - 1].length)
  ) {
    const rootWord = values[values.length - 1].slice(values[1].length);
    return [
      values[0],
      ...values.slice(1, -1).map((v) => v + rootWord),
      values[values.length - 1]
    ];
  }

  return values;
};

export const isKeyInReserve = (key) => {
  // return true, 刪除該符號
  // 符號是 APP, LED 等縮寫
  if (reserveKey.includes(key.toUpperCase())) {
    return true;
  }
  // 符號是英文單字 e.g. expansion card
  if (!/[^a-zA-Z\s_]/.test(key) && key.length >= 5) {
    return true;
  }

  return false;
};

export const getMapValues = (
  descriptionOfElementMap,
  figureOfDrawingsMap,
  regExpsOriginValue
) => {
  const { key, from } = regExpsOriginValue;

  if (from === "d") {
    return descriptionOfElementMap[key];
  }

  if (from === "t") {
    return figureOfDrawingsMap[key];
  }

  return null;
};
