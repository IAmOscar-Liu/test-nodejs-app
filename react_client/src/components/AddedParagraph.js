import React, { useEffect, useState } from "react";

const AddedParagraph = ({
  addedIdx,
  content,
  general,
  updateNewContent,
  deleteNewContent,
  isCollapse,
  openOrCollapseNewContent
}) => {
  const [addedContent, setAddedContent] = useState(content);
  const [addedGeneral, setAddedGeneral] = useState(general);
  const [isEditing, setIsEditing] = useState(false);
  const [editingZoneValue, setEditingZoneValue] = useState({
    general: "",
    content: ""
  });

  useEffect(() => {
    setAddedGeneral(general);
    setAddedContent(content);
  }, [general, content]);

  return (
    <div className="paragraph-container">
      <h2
        onClick={() => openOrCollapseNewContent(addedIdx)}
        style={{ background: "#e49494", boxShadow: "2px 2px 4px 2px #825555" }}
      >
        {`新增段落 【${addedGeneral}】`}
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
                段落編號:{" "}
                <input
                  type="text"
                  style={{
                    fontSize: ".9em",
                    width: 100
                  }}
                  value={editingZoneValue.general}
                  onChange={(e) =>
                    setEditingZoneValue((prev) => ({
                      ...prev,
                      general: e.target.value
                    }))
                  }
                />
              </label>
              <textarea
                style={{ width: "100%", height: 150, fontSize: "1.1em" }}
                value={editingZoneValue.content}
                onChange={(e) =>
                  setEditingZoneValue((prev) => ({
                    ...prev,
                    content: e.target.value
                  }))
                }
              />
            </>
          ) : (
            <>{`【${addedGeneral}:已新增】${addedContent}`}</>
          )}
        </p>
        <div className="paragraph-container-btns">
          {isEditing &&
            (editingZoneValue.general !== addedGeneral ||
              editingZoneValue.content !== addedContent) && (
              <button
                onClick={() => {
                  try {
                    updateNewContent(addedIdx, {
                      general: editingZoneValue.general,
                      content: editingZoneValue.content
                    });
                  } catch (error) {
                    window.alert(error.message);
                    return;
                  }
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
                  general: addedGeneral,
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

export default AddedParagraph;
