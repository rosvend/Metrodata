import { render } from "@testing-library/react";
import { type Lang, LangContext } from "../i18n/lang";

// Render a component with a fixed UI language
export const renderIn = (lang: Lang, ui: React.ReactElement) =>
  render(<LangContext value={{ lang, setLang: () => {} }}>{ui}</LangContext>);
