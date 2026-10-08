import { screen } from "@testing-library/react";
import { renderIn } from "../test/renderIn";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { InfoTip } from "./InfoTip";

it("shows the definition on focus and hides it on Escape", async () => {
  renderIn("en", <InfoTip label="saturation index" text="A proxy only." />);
  const button = screen.getByRole("button", { name: "What is saturation index?" });
  expect(screen.queryByRole("tooltip")).toBeNull();
  await userEvent.tab();
  expect(button).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("A proxy only.");
  expect(button).toHaveAccessibleDescription("A proxy only.");
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
});
