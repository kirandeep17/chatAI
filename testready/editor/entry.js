import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { tags as t } from "@lezer/highlight";

const theme = EditorView.theme({
  "&": { backgroundColor: "var(--code-bg)", color: "var(--ink)", fontSize: "13.5px", border: "1px solid var(--line)", borderRadius: "8px" },
  "&.cm-focused": { outline: "2px solid var(--accent)", outlineOffset: "1px" },
  ".cm-scroller": { fontFamily: "var(--f-mono)", lineHeight: "1.6", minHeight: "180px", maxHeight: "460px" },
  ".cm-content": { caretColor: "var(--accent)", padding: "10px 0" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--accent)", borderLeftWidth: "2px" },
  ".cm-gutters": { backgroundColor: "var(--code-bg)", color: "var(--pend)", border: "none", borderRadius: "8px 0 0 8px" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--ink)" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--accent) 7%, transparent)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "color-mix(in srgb, var(--accent) 28%, transparent) !important" },
  ".cm-matchingBracket": { backgroundColor: "color-mix(in srgb, var(--pass) 25%, transparent)", outline: "none" },
  ".cm-tooltip": { backgroundColor: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line)" },
  ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "var(--accent)", color: "var(--on-accent)" },
  ".cm-panels": { backgroundColor: "var(--surface)", color: "var(--ink)" },
  ".cm-searchMatch": { backgroundColor: "color-mix(in srgb, var(--flaky) 30%, transparent)" },
  ".cm-foldPlaceholder": { backgroundColor: "var(--line)", border: "none", color: "var(--muted)" },
});
const hl = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword, t.definitionKeyword], color: "var(--hl-kw)", fontWeight: "600" },
  { tag: [t.string, t.special(t.string), t.character], color: "var(--hl-str)" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--hl-num)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--hl-com)", fontStyle: "italic" },
  { tag: [t.typeName, t.className, t.namespace], color: "var(--hl-type)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.function(t.variableName))], color: "var(--hl-fn)" },
  { tag: [t.annotation, t.meta, t.self], color: "var(--hl-ann)" },
  { tag: [t.operator, t.punctuation, t.bracket], color: "var(--muted)" },
]);

window.CM = {
  create(parent, { doc, lang, onChange }) {
    const langC = new Compartment();
    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc,
        extensions: [
          basicSetup, keymap.of([indentWithTab]), indentUnit.of("    "), EditorState.tabSize.of(4),
          theme, syntaxHighlighting(hl), langC.of(lang === "py" ? python() : java()),
          EditorView.updateListener.of(u => { if (u.docChanged && onChange) onChange(u.state.doc.toString()); }),
          EditorView.contentAttributes.of({ "aria-label": "Code editor" }),
        ],
      }),
    });
    return {
      view,
      get: () => view.state.doc.toString(),
      set: (text) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } }),
      setLang: (l) => view.dispatch({ effects: langC.reconfigure(l === "py" ? python() : java()) }),
      focus: () => view.focus(),
    };
  },
};
