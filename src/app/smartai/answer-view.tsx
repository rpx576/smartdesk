import { Fragment } from "react";
import { parseInline, parseMarkdown } from "./markdown";

function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) =>
        part.bold ? (
          <strong key={i}>{part.text}</strong>
        ) : part.italic ? (
          <em key={i}>{part.text}</em>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        ),
      )}
    </>
  );
}

/** A SmartAI answer rendered from its Markdown subset (React elements only). */
export function AnswerView({ text }: { text: string }) {
  return (
    <div className="ai-md">
      {parseMarkdown(text).map((block, i) => {
        switch (block.kind) {
          case "heading":
            return block.level === 2 ? (
              <h3 key={i}>
                <InlineText text={block.text} />
              </h3>
            ) : (
              <h4 key={i}>
                <InlineText text={block.text} />
              </h4>
            );
          case "list": {
            const items = block.items.map((item, j) => (
              <li key={j}>
                <InlineText text={item} />
              </li>
            ));
            return block.ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
          }
          case "table":
            return (
              <div key={i} className="ai-md__table">
                <table>
                  <thead>
                    <tr>
                      {block.header.map((cell, j) => (
                        <th key={j} scope="col">
                          <InlineText text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, j) => (
                          <td key={j}>
                            <InlineText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <InlineText text={block.text} />
              </blockquote>
            );
          case "rule":
            return <hr key={i} />;
          case "paragraph":
            return (
              <p key={i}>
                <InlineText text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}
