import React from "react";

/**
 * A product name that wraps onto balanced lines and never breaks inside a
 * hyphenated word ("Gold-Plated" stays together).
 */
export const ProductName: React.FC<{
  name: string;
  style?: React.CSSProperties;
}> = ({ name, style }) => (
  <div style={{ textWrap: "balance", ...style }}>
    {name.split(" ").map((word, k) => (
      <React.Fragment key={word + k}>
        {k > 0 ? " " : null}
        {word.includes("-") ? (
          <span style={{ whiteSpace: "nowrap" }}>{word}</span>
        ) : (
          word
        )}
      </React.Fragment>
    ))}
  </div>
);
