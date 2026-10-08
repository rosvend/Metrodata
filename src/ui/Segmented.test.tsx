import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Segmented } from "./Segmented";

it("exposes a labelled radio group and reports changes", async () => {
  const onChange = vi.fn();
  render(
    <Segmented
      legend="Year"
      options={[
        { value: 2024, label: "2024" },
        { value: 2025, label: "2025" },
      ]}
      value={2024}
      onChange={onChange}
    />,
  );
  expect(screen.getByRole("group", { name: "Year" })).toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "2024" })).toBeChecked();
  await userEvent.click(screen.getByRole("radio", { name: "2025" }));
  expect(onChange).toHaveBeenCalledWith(2025);
});
