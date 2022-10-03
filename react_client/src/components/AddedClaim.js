import React, { useEffect, useState } from "react";
import EditingNewClaimTextArea from "./EditingNewClaimTextArea";

const AddedClaim = ({
  addedIdx,
  claimNum,
  content,
  updateNewContent,
  deleteNewContent,
  isCollapse,
  openOrCollapseNewContent
}) => {
  const [addedContent, setAddedContent] = useState(content);
  const [addedClaimNum, setAddedClaimNum] = useState(claimNum);
  const [isEditing, setIsEditing] = useState(false);
  const [editingZoneValue, setEditingZoneValue] = useState({
    claimNum: "",
    content: ""
  });

  useEffect(() => {
    setAddedClaimNum(claimNum);
    setAddedContent(content);
  }, [claimNum, content]);

  return (
    <div className="paragraph-container">
      <h2
        onClick={() => openOrCollapseNewContent(addedIdx)}
        style={{ background: "#e49494", boxShadow: "2px 2px 4px 2px #825555" }}
      >
        {`【請求項${claimNum}】新增請求項`}
        {!isCollapse ? (
          <span>&#x292C;</span>
        ) : (
          <span style={{ height: "1.38em", lineHeight: "1.25em" }}>
            &#x271B;
          </span>
        )}
      </h2>
      <section style={isCollapse ? { display: "none" } : {}}>
        <p style={{ backgroundColor: "#f7e4e4" }} className="content">
          {isEditing ? (
            <>
              <label
                style={{
                  minWidth: 300,
                  display: "block",
                  marginBottom: ".3em"
                }}
              >
                請求項編號:{" "}
                <input
                  type="text"
                  style={{
                    fontSize: ".9em",
                    width: 100
                  }}
                  value={editingZoneValue.claimNum}
                  onChange={(e) =>
                    setEditingZoneValue((prev) => ({
                      ...prev,
                      claimNum: e.target.value
                    }))
                  }
                />
              </label>
              {/* <textarea
                style={{ width: "50%", height: 150, fontSize: "1.1em" }}
                value={editingZoneValue.content}
                onChange={(e) =>
                  setEditingZoneValue((prev) => ({
                    ...prev,
                    content: e.target.value
                  }))
                }
              /> */}
              <EditingNewClaimTextArea
                editingZoneValue={editingZoneValue}
                setEditingZoneValue={setEditingZoneValue}
              />
            </>
          ) : (
            <>{`【請求項${addedClaimNum}:已新增】${addedContent.replaceAll(
              `@##@`,
              `<br/>`
            )}`}</>
          )}
        </p>
        <div className="paragraph-container-btns">
          {isEditing &&
            (editingZoneValue.claimNum !== addedClaimNum ||
              editingZoneValue.content !== addedContent) && (
              <button
                onClick={() => {
                  updateNewContent(addedIdx, {
                    claimNum: editingZoneValue.claimNum,
                    content: editingZoneValue.content
                  });
                  setIsEditing(false);
                }}
              >
                確認
              </button>
            )}
          <button
            onClick={() => {
              if (!isEditing) {
                setEditingZoneValue({
                  claimNum: addedClaimNum,
                  content: addedContent
                });
              }
              setIsEditing((prev) => !prev);
            }}
          >
            {isEditing ? "取消" : "修正"}
          </button>
          <button onClick={() => deleteNewContent(addedIdx)}>刪除</button>
        </div>
      </section>
    </div>
  );
};

export default AddedClaim;
