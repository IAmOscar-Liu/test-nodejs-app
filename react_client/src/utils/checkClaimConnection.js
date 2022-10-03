export const checkClaimConnection = (claim) => {
  const { content, matches, usedElements, preUsedElements } = claim;
  const sections = content.split("@##@");

  if (sections.length < 2) {
    return;
  }

  for (let i = 0; i < sections.length; i++) {
    const start =
      i === 0
        ? 0
        : sections[i - 1].start +
          sections[i - 1].content.length +
          "@##@".length;

    sections[i] = {
      start,
      content: sections[i],
      matches: matches
        .filter((m) => m.start >= start && m.start < start + sections[i].length)
        .map((m) => ({ ...m, sectionIdx: i })),
      usedElements: usedElements
        .filter((m) => m.start >= start && m.start < start + sections[i].length)
        .map((m) => ({ ...m, sectionIdx: i })),
      preUsedElements: preUsedElements
        .filter((m) => m.start >= start && m.start < start + sections[i].length)
        .map((m) => ({ ...m, sectionIdx: i })),
      connected: i === 0 ? true : false
    };
  }

  sections.forEach((sec, idx) => {
    if (idx === 0) {
      return;
    }

    // console.log("getMainComp: ", idx);
    sec.mainElement = getMainComp(sec, preUsedElements, usedElements);

    /*
    if (sec.matches.length === 0 && sec.usedElements.length === 0) {
      sec.connected = true;
      return;
    }
    */

    if (!sec.mainElement) {
      sec.connected = true;
      return;
    }

    const usedElementInOtherSection = sections
      .filter((_, i) => i < idx)
      .map((s) => s.usedElements)
      .flat();

    sec.matches.forEach((m) => {
      const result = usedElementInOtherSection.filter(
        (other) => other.group === m.group
      );
      result.forEach((r) => {
        if (!sections[r.sectionIdx].connected) {
          sections[r.sectionIdx].connected = true;
        }
        if (!sec.connected) {
          sec.connected = true;
        }
      });
    });
  });

  /*
  if (claim.num === 6) {
    console.log(sections);
    debugger;
  }
  */

  if (sections.length === 2) return;

  sections.forEach((sec, idx) => {
    if (!sec.connected && sec.mainElement) {
      /*
      const otherMainElement = sections
        .filter((_, i) => i !== idx && i !== 0)
        .filter(
          (s) => s.usedElements.length > 0 || s.preUsedElements.length > 0
        )
        .map((s) =>
          s.preUsedElements[0]
            ? (s.usedElements[0]?.start || Infinity) <=
              s.preUsedElements[0].start
              ? s.usedElements[0]
              : s.preUsedElements[0]
            : s.usedElements[0]
        )
        .filter((s) => !!s)
        .map((s) => s.value || s.item);
        */

      // check again, this time, if usedElements and preUsedElements also appear in
      // other section, it's OK
      const elementInOtherSection = sections
        .filter((_, i) => i !== idx)
        .map((s) => [...s.usedElements, ...s.preUsedElements])
        .flat();

      const myElements = [...sec.usedElements, ...sec.preUsedElements];

      for (let m of myElements) {
        if (elementInOtherSection.find((other) => other.group === m.group))
          return;
      }

      /*
      myElements.forEach((m) => {
        const result = elementInOtherSection.filter(
          (other) => other.group === m.group
        );
        result.forEach((r) => {
          if (!sections[r.sectionIdx].connected) {
            sections[r.sectionIdx].connected = true;
          }
          if (!sec.connected) {
            sec.connected = true;
          }
        });
      });

      if (sec.connected) return;
      */

      // fail to find connection
      /*
      const mainElement = sec.preUsedElements[0]
        ? (sec.usedElements[0]?.start || Infinity) <=
          sec.preUsedElements[0].start
          ? sec.usedElements[0].value || sec.usedElements[0].item
          : sec.preUsedElements[0].value || sec.preUsedElements[0].item
        : sec.usedElements[0].value || sec.usedElements[0].item;
        */
      // console.log("section idx", idx);
      // debugger;

      const otherMainElement = sections
        .filter((_, i) => i !== idx && i !== 0)
        .map((s) => s.mainElement)
        .filter((s) => !!s);

      claim.errors.push({
        message: `主要構件「${
          sec.mainElement
        }」，未記載與其他主要構件「${otherMainElement.join(
          "」、「"
        )}」之連結或其對應關係。`,
        start: content.length,
        end: content.length,
        mainElement: sec.mainElement,
        otherMainElement
      });
    }
  });
};

const getMainComp = (sec, preUsedElements, usedElements) => {
  /*
      const mainElement = sec.preUsedElements[0]
        ? (sec.usedElements[0]?.start || Infinity) <=
          sec.preUsedElements[0].start
          ? sec.usedElements[0].value || sec.usedElements[0].item
          : sec.preUsedElements[0].value || sec.preUsedElements[0].item
        : sec.usedElements[0].value || sec.usedElements[0].item;
  */

  if (sec.preUsedElements.length === 0 && sec.usedElements.length === 0)
    return null;

  const mainComp =
    (sec.preUsedElements[0]?.start || Infinity) <
    (sec.usedElements[0]?.start || Infinity)
      ? { ...sec.preUsedElements[0], mainCompType: "preUsedElements" }
      : { ...sec.usedElements[0], mainCompType: "usedElements" };

  if ((sec.matches[0]?.start || Infinity) <= mainComp.start) return null;

  // console.log(mainComp);
  // console.log(sec.matches);
  // debugger;

  if (mainComp.mainCompType === "preUsedElements") {
    preUsedElements[
      preUsedElements.findIndex((e) => e.start === mainComp.start)
    ].isMainComp = true;
  } else {
    usedElements[
      usedElements.findIndex((e) => e.start === mainComp.start)
    ].isMainComp = true;
  }

  return mainComp.value || mainComp.item;
};
