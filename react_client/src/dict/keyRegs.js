export const allSymbolChar = `\\u03B1-\\u09B6θ”′″0-9a-z`;

export const keyReg = RegExp(
  /^\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″′″]?\)?([,、]\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?)*$|^\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?(\s*[-~～]?\s*\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?)?$/i
);

export const keyWithRangeStart = RegExp(
  /^\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?(\s*[-~～]?\s*\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?)?/i
);

export const keyWithRangeEnd = RegExp(
  /\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?(\s*[-~～]?\s*\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?)?$/i
);

export const keyWithRangeBetween = RegExp(
  /[\u4E00-\u9FFF]\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?(\s*[-~～]?\s*\(?[\u03B1-\u09B6θa-z0-9]+['”′″]?\)?)?/gi
);

export const keyWithCommaStart = RegExp(
  /^\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?([,、]\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?)*/i
);

export const keyWithCommaEnd = RegExp(
  /\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?([,、]\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?)*$/i
);

export const keyWithCommaBetween = RegExp(
  /[\u4E00-\u9FFF]\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?([,、]\(?[\u03B1-\u09B6θθ0-9a-z]+['”′″]?\)?)*/gi
);

export const isKeyValid = (key) => keyReg.test(key);

export const isKeyStart = (key) =>
  keyWithCommaStart.test(key) || keyWithRangeStart.test(key);

export const isKeyEnd = (key) =>
  keyWithCommaEnd.test(key) || keyWithRangeEnd.test(key);

export const keyStartMatch = (key) => {
  const commaMatch = key.match(keyWithCommaStart);
  const rangeMatch = key.match(keyWithRangeStart);

  if ((commaMatch || rangeMatch) === null) return null;
  if (commaMatch && !rangeMatch) return commaMatch;
  else if (!commaMatch && rangeMatch) return rangeMatch;
  else
    return commaMatch[0].length > rangeMatch[0].length
      ? commaMatch
      : rangeMatch;
};

export const keyEndMatch = (key) => {
  const commaMatch = key.match(keyWithCommaEnd);
  const rangeMatch = key.match(keyWithRangeEnd);

  if ((commaMatch || rangeMatch) === null) return null;
  if (commaMatch && !rangeMatch) return commaMatch;
  else if (!commaMatch && rangeMatch) return rangeMatch;
  else
    return commaMatch[0].length > rangeMatch[0].length
      ? commaMatch
      : rangeMatch;
};

export const allKeyBetweenMatch = (paragraph) => {
  const allCommaMatch = [...paragraph.matchAll(keyWithCommaBetween)];
  const allRangeMatch = [...paragraph.matchAll(keyWithRangeBetween)];

  /*return allCommaMatch.map((match, index) => {
    let myMatch =
      match[0].length > allRangeMatch[index][0].length
        ? match
        : allRangeMatch[index];
    myMatch[0] = myMatch[0].slice(1);
    myMatch.index++;
    // ["323、333", undefined, index: 12, input: "更優選的是，......]
    return myMatch;
  });*/

  const allMatches = [...allCommaMatch, ...allRangeMatch].sort(
    (a, b) => a.index - b.index
  );
  const finalMatches = [];

  while (allMatches.length > 0) {
    const tmp = allMatches.shift();
    tmp[0] = tmp[0].slice(1);
    tmp.index++;

    if (
      tmp.index >
      (finalMatches[finalMatches.length - 1]?.index ?? -1) +
        (finalMatches[finalMatches.length - 1]?.[0].length ?? 0)
    ) {
      finalMatches.push(tmp);
      continue;
    }

    if (
      tmp.index === (finalMatches[finalMatches.length - 1]?.index ?? -1) &&
      tmp[0].length > (finalMatches[finalMatches.length - 1]?.[0].length ?? 0)
    ) {
      finalMatches[finalMatches.length - 1] = tmp;
    }
  }

  return finalMatches;
};
