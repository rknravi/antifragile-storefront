"use client";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { search } from "@codemirror/search";
import { githubLight } from "@uiw/codemirror-theme-github";
import { EditorView } from "@codemirror/view";

type Props = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

export function CatalogJsonCodeEditor({ value, onChange, readOnly = false }: Props) {
  return (
    <CodeMirror
      value={value}
      height="min(72vh, 640px)"
      theme={githubLight}
      extensions={[json(), EditorView.lineWrapping, search({ top: true })]}
      onChange={onChange}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        bracketMatching: true,
        indentOnInput: true,
        autocompletion: true,
        closeBrackets: true,
      }}
      className="catalog-codemirror overflow-hidden rounded-b-xl text-sm"
    />
  );
}
