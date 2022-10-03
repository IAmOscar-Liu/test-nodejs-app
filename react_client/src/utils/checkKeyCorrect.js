import { isKeyInReserve } from "./otherUtils";

export const checkKeyCorrect = (
  item,
  keys,
  descriptionOfElementMap,
  figureOfDrawingsMap
) => {
  // Test
  /*
  if (item === "第二排程選項" && keys && keys.length > 3) {
    console.log(Object.keys(descriptionOfElementMap));
    console.log(keys);
    console.log(
      Object.keys(descriptionOfElementMap)
        .filter((k) => k.startsWith(`15_duplicate`))
        .map((k) => descriptionOfElementMap[k].values.includes(item))
    );
    debugger;
  }
  */

  if (keys.length === 1 && (keys[0] === "" || keys[0] === undefined)) {
    return [true];
  } else {
    return keys.map((key) => {
      // Test
      /*
      if (key === "elongatedstructuralsupport") {
        console.log(key);
        debugger;
      }
      */

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

      /*
      if (
        descriptionOfElementMap[key] === undefined &&
        !Object.keys(descriptionOfElementMap).find((k) =>
          k.startsWith(`${key}_duplicate`)
        )
      ) {
        return false;
      }
      */

      return (
        Object.keys(descriptionOfElementMap)
          .filter((k) => k.startsWith(`${key}_duplicate`))
          .some((k) => descriptionOfElementMap[k].values.includes(item)) ||
        isKeyInReserve(key)
      );
    });
  }
};

/*
export const checkKeyCorrect = (item, keys, descriptionOfElementMap) => {
  if (keys.length === 1 && (keys[0] === "" || keys[0] === undefined)) {
    return [true];
  } else {
    return keys.map((key) => {
      if (descriptionOfElementMap[key] === undefined) {
        return false;
      }
      return descriptionOfElementMap[key].values.includes(item);
    });
  }
};
*/
