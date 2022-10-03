export const checkFigureOfDrawings = ({
  figureOfDrawingsMap,
  descriptionOfElementMap
}) => {
  Object.keys(figureOfDrawingsMap).forEach((key) => {
    // 同一個符號出現2次以上
    if (figureOfDrawingsMap[key].status === "key duplicate") {
      return;
    }

    if (descriptionOfElementMap[key] === undefined) {
      return;
    }

    if (
      figureOfDrawingsMap[key].values.length === 1 &&
      (figureOfDrawingsMap[key].values[0] ===
        descriptionOfElementMap[key].values[0] ||
        descriptionOfElementMap[key].values.includes(
          figureOfDrawingsMap[key].values[0]
        ))
    ) {
      figureOfDrawingsMap[key].status = "Ok";
      descriptionOfElementMap[key].isUsed = true;
    } else if (
      figureOfDrawingsMap[key].values.length > 1 &&
      !figureOfDrawingsMap[key].values
        .filter((e, i) => i !== 0)
        .some(
          (val) =>
            !descriptionOfElementMap[key].values
              .filter((e, i) => i !== 0)
              .includes(val)
        )
    ) {
      figureOfDrawingsMap[key].status = "Ok";
      descriptionOfElementMap[key].isUsed = true;
    } else {
      // 指定代表圖與說明書的元件明稱不一致
      figureOfDrawingsMap[key].status = "element inconsistent";
      descriptionOfElementMap[key].status = "element inconsistent";
    }
  });
};
