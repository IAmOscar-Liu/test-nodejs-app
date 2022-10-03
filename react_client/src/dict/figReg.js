export const figWithRangeStart = RegExp(
  /^圖\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?(\s*[-~～到至]?\s*圖?\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?)?/gi
);

export const figWithCommaStart = RegExp(
  /^圖\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?([,、或與和以及跟]圖?\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?)*/gi
);

export const figWithRangeBetween = RegExp(
  /圖\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?(\s*[-~～到至]?\s*圖?\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?)?/gi
);

export const figWithCommaBetween = RegExp(
  /圖\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?([,、或與和以及跟]圖?\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?)*/gi
);

export const figWithThisRangeStart = RegExp(
  /^第\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?圖?(\s*[-~～到至]?\s*第?\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?)?圖/gi
);

export const figWithThisCommaStart = RegExp(
  /^第\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?圖?([,、或與和以及跟]第?\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?)*圖/gi
);

export const figWithThisRangeBetween = RegExp(
  /第\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?圖?(\s*[-~～到至]?\s*第?\(?[\u03B1-\u09B6θa-z0-9一二三四五六七八九十(]+['”′″]?\)?)?圖/gi
);

export const figWithThisCommaBetween = RegExp(
  /第\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?圖?([,、或與和以及跟]第?\(?[\u03B1-\u09B6θθ0-9a-z一二三四五六七八九十(]+['”′″]?\)?)*圖/gi
);

export const figStartMatch = (key) => {
  const commaMatch =
    key.match(figWithCommaStart) || key.match(figWithThisCommaStart);
  const rangeMatch =
    key.match(figWithRangeStart) || key.match(figWithThisRangeStart);

  if ((commaMatch || rangeMatch) === null) return null;
  if (commaMatch && !rangeMatch) return commaMatch;
  else if (!commaMatch && rangeMatch) return rangeMatch;
  else
    return commaMatch[0].length > rangeMatch[0].length
      ? commaMatch
      : rangeMatch;
};

export const allFigBetweenMatch = (paragraph) => {
  const allCommaMatch = [
    ...paragraph.matchAll(figWithCommaBetween),
    ...paragraph.matchAll(figWithThisCommaBetween)
  ];
  const allRangeMatch = [
    ...paragraph.matchAll(figWithRangeBetween),
    ...paragraph.matchAll(figWithThisRangeBetween)
  ];

  const allMatches = [...allCommaMatch, ...allRangeMatch].sort(
    (a, b) => a.index - b.index
  );
  const finalMatches = [];

  while (allMatches.length > 0) {
    const tmp = allMatches.shift();

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
