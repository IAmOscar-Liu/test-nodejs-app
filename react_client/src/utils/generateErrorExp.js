export const generateErrorExp = (essentialData) => {
  if (
    essentialData.applicationNum[3] !== "1" &&
    /(方法|程序|流程|步驟)$/.test(essentialData.utilityModelTitle)
  ) {
    essentialData.allErrors.title.push({
      message: `本案請求之標的係為方法，非屬物品之形狀、構造或組合者，不符新型標的之規定，應予修正。查違反專利法第104條之規定。`
    });
  }

  // descriptionOfElementMap
  Object.keys(essentialData.descriptionOfElementMap).forEach((key) => {
    if (essentialData.descriptionOfElementMap[key].status === "key duplicate") {
      essentialData.allErrors.descriptionOfElementMap.push({
        message: `本案「符號說明」所述之構件「${
          essentialData.descriptionOfElementMap[key].values[0]
        }（${key.slice(
          0,
          key.indexOf("_duplicate")
        )}）」其符號與「符號說明」所述之構件「${
          essentialData.descriptionOfElementMap[
            key.slice(0, key.indexOf("_duplicate"))
          ].values[0]
        }（${key.slice(
          0,
          key.indexOf("_duplicate")
        )}）」重複，應予修正。【摘要、說明書及圖式其餘部分請一併確認及修正】`
      });
    }
  });

  // figureOfDrawingsMap
  Object.keys(essentialData.figureOfDrawingsMap).forEach((key) => {
    if (essentialData.figureOfDrawingsMap[key].status === "key duplicate") {
      essentialData.allErrors.figureOfDrawingsMap.push({
        message: `本案「代表圖之符號簡單說明」所述之構件「${
          essentialData.figureOfDrawingsMap[key].values[0]
        }（${key.slice(
          0,
          key.indexOf("_duplicate")
        )}）」其符號與「代表圖之符號簡單說明」所述之構件「${
          essentialData.figureOfDrawingsMap[
            key.slice(0, key.indexOf("_duplicate"))
          ].values[0]
        }（${key.slice(
          0,
          key.indexOf("_duplicate")
        )}）」重複，應予修正。【摘要、說明書及圖式其餘部分請一併確認及修正】`
      });
    }
  });

  // failedDescriptionOfElementMap
  essentialData.failedDescriptionOfElementMap.forEach(({ num, el }) => {
    essentialData.allErrors.system.push({
      message: `本案「符號說明」第${
        num + 1
      }行所述之元件名稱及符號「${el}」系統無法判別，建議修正此元件後再重新分析。`
    });
  });

  // failedFigureOfDrawingsMap
  essentialData.failedFigureOfDrawingsMap.forEach(({ num, el }) => {
    essentialData.allErrors.system.push({
      message: `本案「代表圖之符號簡單說明」第${
        num + 1
      }行所述之元件名稱及符號「${el}」系統無法判別，建議修正此元件後再重新分析。`
    });
  });

  // allDisclosureParagraphDetails -> paragraphMatch -> wrongs
  essentialData.allDisclosureParagraphDetails.forEach((para) => {
    const general = para.general;
    para.paragraphMatch.wrongs.forEach(
      ({ group, item, value, fullValue, wrongKeys }) => {
        const correctKeyInDescriptionOfElement = getKeyInDescriptionOfElementMapCorrect(
          essentialData,
          item,
          group
        );
        const correctKeyInFigureOfDrawingsMap = getKeyInFigureOfDrawingsMapCorrect(
          essentialData,
          item,
          group
        );
        const correctNameInDescriptionOfElementMap = getNameInDescriptionOfElementMapCorrect(
          essentialData,
          wrongKeys
        );
        const correctNameInFigureOfDrawingsMap = getNameInFigureOfDrawingsMapCorrect(
          essentialData,
          wrongKeys
        );

        if (
          correctKeyInDescriptionOfElement ||
          correctKeyInFigureOfDrawingsMap
        ) {
          // 元件名稱正確 符號錯誤
          let midMessage;
          if (
            correctKeyInDescriptionOfElement &&
            correctKeyInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」及「代表圖之符號簡單說明」`;
          } else if (
            correctKeyInDescriptionOfElement &&
            !correctKeyInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」`;
          } else {
            midMessage = `，與「代表圖之符號簡單說明」`;
          }
          essentialData.allErrors.allDisclosureParagraphDetails.push({
            message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「說明書」之「新型內容」內容之記載未依前開規定之格式撰寫（段落編號【${general}】第　、　行 ／ 第　頁第　、　行之構件「${
              fullValue || value || item
            }（${wrongKeys
              .filter((k) => k !== "")
              .join("）、（")}）」${midMessage}所述之構件「${
              fullValue || value || item
            }　（${
              correctKeyInDescriptionOfElement ||
              correctKeyInFigureOfDrawingsMap
            }）」，其符號不一致，應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
          });
        } else if (
          correctNameInDescriptionOfElementMap ||
          correctNameInFigureOfDrawingsMap
        ) {
          // 符號正確  元件名稱錯誤
          let midMessage;
          if (
            correctNameInDescriptionOfElementMap &&
            correctNameInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」及「代表圖之符號簡單說明」`;
          } else if (
            correctNameInDescriptionOfElementMap &&
            !correctNameInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」`;
          } else {
            midMessage = `，與「代表圖之符號簡單說明」`;
          }
          essentialData.allErrors.allDisclosureParagraphDetails.push({
            message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「說明書」之「新型內容」內容之記載未依前開規定之格式撰寫（段落編號【${general}】第　、　行 ／ 第　頁第　、　行之構件「${item}（${wrongKeys
              .filter((k) => k !== "")
              .join("）、（")}）」${midMessage}所述之構件「${
              correctNameInDescriptionOfElementMap ||
              correctNameInFigureOfDrawingsMap
            }　（${wrongKeys
              .filter((k) => k !== "")
              .join(
                "）、（"
              )}）」，其名稱用語不一致，應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
          });
        }
      }
    );

    para.paragraphMatch.wrongWords.forEach(({ value }) => {
      essentialData.allErrors.allDisclosureParagraphDetails.push({
        message: `「說明書」之「新型內容」（段落編號【${general}】第　、　行 ／ 第　頁第　、　行）中，其所述之文字敘述「${value}」，應修正為「本創作」、「本新型」或其它屬新型之用語，應予修正。`
      });
    });
  });

  // allModeForInventionParagraphDetails -> paragraphMatch -> wrong
  essentialData.allModeForInventionParagraphDetails.forEach((para) => {
    const general = para.general;
    para.paragraphMatch.wrongs.forEach(
      ({ group, item, value, fullValue, wrongKeys }) => {
        const correctKeyInDescriptionOfElement = getKeyInDescriptionOfElementMapCorrect(
          essentialData,
          item,
          group
        );
        const correctKeyInFigureOfDrawingsMap = getKeyInFigureOfDrawingsMapCorrect(
          essentialData,
          item,
          group
        );
        const correctNameInDescriptionOfElementMap = getNameInDescriptionOfElementMapCorrect(
          essentialData,
          wrongKeys
        );
        const correctNameInFigureOfDrawingsMap = getNameInFigureOfDrawingsMapCorrect(
          essentialData,
          wrongKeys
        );

        if (
          correctKeyInDescriptionOfElement ||
          correctKeyInFigureOfDrawingsMap
        ) {
          // 元件名稱正確 符號錯誤
          let midMessage;
          if (
            correctKeyInDescriptionOfElement &&
            correctKeyInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」及「代表圖之符號簡單說明」`;
          } else if (
            correctKeyInDescriptionOfElement &&
            !correctKeyInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」`;
          } else {
            midMessage = `，與「代表圖之符號簡單說明」`;
          }
          essentialData.allErrors.allModeForInventionParagraphDetails.push({
            message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「說明書」之「實施方式」內容之記載未依前開規定之格式撰寫（段落編號【${general}】第　、　行 ／ 第　頁第　、　行之構件「${
              fullValue || value || item
            }（${wrongKeys
              .filter((k) => k !== "")
              .join("）、（")}）」${midMessage}所述之構件「${
              fullValue || value || item
            }（${
              correctKeyInDescriptionOfElement ||
              correctKeyInFigureOfDrawingsMap
            }）」，其符號不一致，應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
          });
        } else if (
          correctNameInDescriptionOfElementMap ||
          correctNameInFigureOfDrawingsMap
        ) {
          // 符號正確  元件名稱錯誤
          let midMessage;
          if (
            correctNameInDescriptionOfElementMap &&
            correctNameInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」及「代表圖之符號簡單說明」`;
          } else if (
            correctNameInDescriptionOfElementMap &&
            !correctNameInFigureOfDrawingsMap
          ) {
            midMessage = `，與「符號說明」`;
          } else {
            midMessage = `，與「代表圖之符號簡單說明」`;
          }
          essentialData.allErrors.allModeForInventionParagraphDetails.push({
            message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「說明書」之「實施方式」內容之記載未依前開規定之格式撰寫（段落編號【${general}】第　、　行 ／ 第　頁第　、　行之構件「${item}（${wrongKeys
              .filter((k) => k !== "")
              .join("）、（")}）」${midMessage}所述之構件「${
              correctNameInDescriptionOfElementMap ||
              correctNameInFigureOfDrawingsMap
            }（${wrongKeys
              .filter((k) => k !== "")
              .join(
                "）、（"
              )}）」，其名稱用語不一致，應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
          });
        }
      }
    );

    para.paragraphMatch.wrongWords.forEach(({ value }) => {
      essentialData.allErrors.allModeForInventionParagraphDetails.push({
        message: `「說明書」之「實施方式」（段落編號【${general}】第　、　行 ／ 第　頁第　、　行）中，其所述之文字敘述「${value}」，應修正為「本創作」、「本新型」或其它屬新型之用語，應予修正。`
      });
    });
  });

  // allClaimsDetails
  essentialData.allClaimsDetails.forEach((claim) => {
    const num = claim.num;
    claim.errors.forEach(
      ({
        message,
        name,
        wrongKeys,
        mainElement,
        errorContent,
        otherMainElement,
        utilityModelTitle
      }) => {
        if (!message) {
          return;
        }
        // system error
        if (claim.type === "unknown") {
          essentialData.allErrors.system.push({
            message: `本案「申請專利範圍」第${num}項的內容系統無法判別，建議修正此請求項後再重新分析。`
          });
          return;
        }
        if (message === "分析此請求項時發生問題") {
          essentialData.allErrors.system.push({
            message: `本案「申請專利範圍」第${num}項的內容系統分析此請求項時發生問題，建議修正此請求項後再重新分析。`
          });
          return;
        }

        try {
          if (
            /^本請求項所依附之請求項[0-9]+為多項附屬項[直間]接依附多項附屬項/.test(
              message
            )
          ) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `依專利法施行細則第45條準用第18條第5項之規定：「…。但多項附屬項間不得直接或間接依附。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項係為多項附屬項，依規定不得直接或間接依附於多項附屬項第${
                message.match(/[0-9]+/)[0]
              }項），應予修正。查違反專利法第120條準用第26條第4項之規定。`
            });
          } else if (
            /不符合附屬項之記載形式/.test(message) ||
            message.startsWith("附屬項未以「如」、「依據」或「根據」等用語開頭")
          ) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `申請專利範圍第${num}項（附屬項），其文字開頭應修正為「如申請專利範圍第X項所述之……」或「如請求項X所述之……」（其中X為阿拉伯數字），以符合附屬項之記載形式，應予修正。`
            });
          } else if (/^請求項未以單句為之/.test(message)) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `依專利法施行細則第45條準用第18條第6項之規定：「。獨立項或附屬項之文字敘述，應以單句為之」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（${
                message.includes("句號在句中")
                  ? "於句中出現句點為不當之處"
                  : "文字敘述未以單句為之"
              }），應予修正。查違反專利法第120條準用第26條第4項之規定。`
            });
          } else if (/的符號未置於括號內/.test(message)) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `依專利法施行細則第45條準用第19條第2項規定：「請求項之技術特徵得引用圖式中對應之符號，該符號應附加於對應之技術特徵後，並置於括號內；…。」本案「申請專利範圍」第${num}項第　行內容「${message
                .match(/「.*」/)[0]
                .slice(
                  1,
                  -1
                )}」之記載未依前開規定之格式撰寫（申請專利範圍之符號應全部引用並置於括號內或將申請專利範圍中之符號全數加以刪除），應予修正。查違反專利法第120條準用第26條第4項之規定。`
            });
          } else if (
            /^本請求項標的名稱「.+?」與所依附之請求項\([0-9]+\)之標的名稱「.+?」用語不一致/.test(
              message
            )
          ) {
            const elNames = [...message.matchAll(/「.+?」/g)].map((m) =>
              m[0].slice(1, -1)
            );
            const refClaimNum = message.match(/\([0-9]+\)/)[0].slice(1, -1);
            essentialData.allErrors.allClaimsDetails.push({
              message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項所述標的名稱「${elNames[0]}」，與直接或間接依附之申請專利範圍第${refClaimNum}項標的名稱「${elNames[1]}」，其名稱用語不一致），應予修正。查違反專利法第120條準用第26條第4項之規定。`
            });
          } else if (
            /^請求項[0-9]+即為本身，不可依附自己/.test(message) ||
            /^請求項[0-9]+不在該請求項之前或不存在/.test(message)
          ) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `依專利法施行細則第45條準用第18條第5項之規定：「附屬項僅得依附在前之獨立項或附屬項。…。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項所依附之申請專利範圍項號第${
                message.match(/[0-9]+/)[0]
              }項有誤），應予修正。查違反專利法第120條準用第26條第4項之規定。`
            });
          } else if (
            /^多項附屬項未以選擇式為之/.test(message) ||
            /^引用記載型式未以選擇式為之/.test(message)
          ) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `依專利法施行細則第45條準用第18條第4項之規定：「依附於二項以上之附屬項為多項附屬項，應以選擇式為之。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項係為多項附屬項，未以選擇式為之），應予修正。查違反專利法第120條準用第26條第4項之規定。`
            });
          } else if (/^元件名稱「.+?」未見於本請求項先前內容/.test(message)) {
            let dispMsg;
            const eln = message.match(/「.+?」/)[0].slice(1, -1);
            if (claim.type === "independent") {
              dispMsg = `申請專利範圍第${num}項（獨立項）第　行所述之構件「${eln}」，於該構件前之文字敘述未揭露該構件，應予修正。查違反專利法第112條第5款之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`;
            } else {
              const prevClaimNum = message
                .match(/\([0-9]+\)/)?.[0]
                .slice(1, -1);
              dispMsg = `依專利法施行細則第45條準用第18條第1項之規定：「…。獨立項、附屬項，應以其依附關係，依序以阿拉伯數字編號排列。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項第　行所述之構件「${eln}」，於${
                prevClaimNum
                  ? "所依附申請專利範圍第" + prevClaimNum + "項中未揭示此構件"
                  : "該構件前之文字敘述未揭露該構件"
              }，係不當依附），應予修正。查違反專利法第120條準用第26條第4項規定之規定。【摘要、說明書其餘部分請一併確認及修正】`;
            }
            essentialData.allErrors.allClaimsDetails.push({
              message: dispMsg
            });
          } else if (/^「.+?」的元件名稱或符號錯誤/.test(message)) {
            const correctKeyInDescriptionOfElement = getKeyInDescriptionOfElementMapCorrect(
              essentialData,
              name,
              "abc"
            );
            const correctKeyInFigureOfDrawingsMap = getKeyInFigureOfDrawingsMapCorrect(
              essentialData,
              name,
              "abc"
            );
            const correctNameInDescriptionOfElementMap = getNameInDescriptionOfElementMapCorrect(
              essentialData,
              wrongKeys
            );
            const correctNameInFigureOfDrawingsMap = getNameInFigureOfDrawingsMapCorrect(
              essentialData,
              wrongKeys
            );
            let eln = message.match(/「.+?」/)[0].slice(1, -1);
            eln = eln.slice(0, eln.indexOf("（"));

            if (
              correctKeyInDescriptionOfElement ||
              correctKeyInFigureOfDrawingsMap
            ) {
              // 元件名稱正確 符號錯誤

              let midMessage;
              if (
                correctKeyInDescriptionOfElement &&
                correctKeyInFigureOfDrawingsMap
              ) {
                midMessage = `，與「符號說明」及「代表圖之符號簡單說明」`;
              } else if (
                correctKeyInDescriptionOfElement &&
                !correctKeyInFigureOfDrawingsMap
              ) {
                midMessage = `，與「符號說明」`;
              } else {
                midMessage = `，與「代表圖之符號簡單說明」`;
              }

              essentialData.allErrors.allClaimsDetails.push({
                message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項第　行所述之構件「${eln}（${wrongKeys
                  .filter((k) => k !== "")
                  .join("）、（")}）」${midMessage}所述之構件「${name}（${
                  correctKeyInDescriptionOfElement ||
                  correctKeyInFigureOfDrawingsMap
                }）」，其符號不一致，應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
              });
            } else if (
              correctNameInDescriptionOfElementMap ||
              correctNameInFigureOfDrawingsMap
            ) {
              // 符號正確  元件名稱錯誤
              let midMessage;
              if (
                correctNameInDescriptionOfElementMap &&
                correctNameInFigureOfDrawingsMap
              ) {
                midMessage = `，與「符號說明」及「代表圖之符號簡單說明」`;
              } else if (
                correctNameInDescriptionOfElementMap &&
                !correctNameInFigureOfDrawingsMap
              ) {
                midMessage = `，與「符號說明」`;
              } else {
                midMessage = `，與「代表圖之符號簡單說明」`;
              }
              essentialData.allErrors.allClaimsDetails.push({
                message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「申請專利範圍」第${num}項內容之記載未依前開規定之格式撰寫（該項第　行所述之構件「${eln}（${wrongKeys
                  .filter((k) => k !== "")
                  .join("）、（")}）」${midMessage}所述之構件「${
                  correctNameInDescriptionOfElementMap ||
                  correctNameInFigureOfDrawingsMap
                }（${wrongKeys
                  .filter((k) => k !== "")
                  .join(
                    "）、（"
                  )}）」，其名稱用語不一致，應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
              });
            }
          } else if (/^主要構件「.+?」，未記載與其他主要構件/.test(message)) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `申請專利範圍第${num}項（獨立項）第　、　行所述之構件「${mainElement}」，未記載與其他構件「${otherMainElement.join(
                "」、「"
              )}」之連結或其對應關係，應予修正。查違反專利法第112條第5款之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
            });
          } else if (
            /係為(方法|程序|流程|步驟)，不符新型標的之規定/.test(message)
          ) {
            essentialData.allErrors.allClaimsDetails.push({
              message: `申請專利範圍第${num}項（獨立項）請求之標的係為${errorContent}，非屬物品之形狀、構造或組合者，不符新型標的之規定，應予修正。查違反專利法第104條之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
            });
          } else if (
            /^標的名稱「.+?」與新型名稱「.+?」用語不相符/.test(message)
          ) {
            if (
              essentialData.allErrors.allClaimsDetails.find(
                (claimErr) =>
                  claimErr.mainElement === mainElement &&
                  claimErr.utilityModelTitle === utilityModelTitle
              )
            ) {
              const claimErrIdx = essentialData.allErrors.allClaimsDetails.findIndex(
                (claimErr) =>
                  claimErr.mainElement === mainElement &&
                  claimErr.utilityModelTitle === utilityModelTitle
              );
              const claimErrorCtx =
                essentialData.allErrors.allClaimsDetails[claimErrIdx];
              essentialData.allErrors.allClaimsDetails[claimErrIdx] = {
                ...claimErrorCtx,
                claims: [...claimErrorCtx.claims, num],
                message: generateInvalidMainElementMessage(
                  mainElement,
                  utilityModelTitle,
                  [...claimErrorCtx.claims, num]
                )
              };
            } else {
              essentialData.allErrors.allClaimsDetails.push({
                mainElement,
                utilityModelTitle,
                claims: [num],
                message: generateInvalidMainElementMessage(
                  mainElement,
                  utilityModelTitle,
                  [num]
                )
              });
            }
          }
        } catch (e) {
          console.log("產生分析結果時發生問題", e.message);
          return;
        }
      }
    );
  });
  // essentialData.allErrors.allClaimsDetails = essentialData.allErrors.allClaimsDetails.reduce(
  //   (acc, cur) => {
  //     if (acc.map(({ message }) => message).includes(cur.message)) {
  //       return acc;
  //     }
  //     return [...acc, { message: cur.message }];
  //   },
  //   []
  // );
  // essentialData.allErrors.allClaimsDetails = removeRepeatedMessage(
  //   essentialData.allErrors.allClaimsDetails
  // );
  Object.keys(essentialData.allErrors).forEach((errType) => {
    essentialData.allErrors[errType] = removeRepeatedMessage(
      essentialData.allErrors[errType]
    );
  });
};

/*
essentialData.allErrors.allDisclosureParagraphDetails.push({
        message: `依專利法施行細則第45條準用第22條第1項之規定：「說明書、申請專利範圍及摘要中之技術用語及符號應一致。」本案「說明書」內容之記載未依前開規定之格式撰寫（段落編號【　】第　、　行 ／ 第　頁第　、　行之構件「　（　）」，與「符號說明」所述之構件「　（　）」，其名稱用語 ／ 符號不一致），應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書及圖式其餘部分請一併確認及修正】`
      });
*/

const removeRepeatedMessage = (data) => {
  return data.reduce((acc, cur) => {
    if (acc.map(({ message }) => message).includes(cur.message)) {
      return acc;
    }
    return [...acc, { message: cur.message }];
  }, []);
};

const getKeyInDescriptionOfElementMapCorrect = (essentialData, item, group) => {
  // get the key corresponds to the correct element name
  return Object.keys(essentialData.descriptionOfElementMap).find(
    (key) =>
      essentialData.descriptionOfElementMap[key].id === group ||
      essentialData.descriptionOfElementMap[key].values[0] === item
  );
};

const getKeyInFigureOfDrawingsMapCorrect = (essentialData, item, group) => {
  // get the key corresponds to the correct element name
  return Object.keys(essentialData.figureOfDrawingsMap).find(
    (key) =>
      essentialData.figureOfDrawingsMap[key].id === group ||
      essentialData.figureOfDrawingsMap[key].values[0] === item
  );
};

const getNameInDescriptionOfElementMapCorrect = (essentialData, wrongKeys) => {
  // get the element name corresponds to the correct key
  for (let key of wrongKeys) {
    if (essentialData.descriptionOfElementMap[key]) {
      return essentialData.descriptionOfElementMap[key].values[0];
    }
  }
  return undefined;
};

const getNameInFigureOfDrawingsMapCorrect = (essentialData, wrongKeys) => {
  // get the element name corresponds to the correct key
  for (let key of wrongKeys) {
    if (essentialData.figureOfDrawingsMap[key]) {
      return essentialData.figureOfDrawingsMap[key].values[0];
    }
  }
  return undefined;
};

const generateInvalidMainElementMessage = (
  mainElement,
  utilityModelTitle,
  claimNums
) => {
  let prevClaimNum = claimNums.shift();
  const rangeSets = [{ from: prevClaimNum }];

  while (claimNums.length > 0) {
    const currentClaimNum = claimNums.shift();
    if (currentClaimNum - 1 === prevClaimNum) {
      rangeSets[rangeSets.length - 1].to = currentClaimNum;
    } else {
      rangeSets.push({
        from: currentClaimNum
      });
    }
    prevClaimNum = currentClaimNum;
  }

  const rangeText = [];
  rangeSets.forEach((r) => {
    if (r.to !== undefined) {
      rangeText.push(`第${r.from}至${r.to}項`);
    } else {
      rangeText.push(`第${r.from}項`);
    }
  });

  return `依專利法施行細則第45條準用第17條第4項之規定：「發明名稱，應簡明表示所申請發明之內容，不得冠以無關之文字。」本案新型名稱「${utilityModelTitle}」內容之記載未依前開規定之格式撰寫（新型名稱「${utilityModelTitle}」與申請專利範圍${rangeText.join(
    "、"
  )}所述標的名稱「${mainElement}」，其名稱用語不相符），應予修正。查違反專利法第120條準用第26條第4項之規定。【摘要、說明書其餘部分請一併確認及修正】`;
};
