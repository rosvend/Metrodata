import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DataQuality } from "../data/types";
import { AboutContent } from "./AboutContent";

const quality: DataQuality = {
  generated_at: "2026-10-08T11:50:00",
  files: {
    "2024": {
      file: "a.xlsx",
      rows: 4294,
      total_boardings: 1,
      coverage: ["2024-01-01", "2024-12-31"],
      missing_dates: ["2024-01-15"],
    },
  },
  reconciliation: { "2026_matches": true, hour_sum_mismatches: 0, duplicate_line_days: 0 },
  excluded_dates: [
    { date: "2024-02-20", reason: "probable logging failure; about 700,000 were expected", system_boardings: 6570 },
  ],
  spike_index: { insufficient_baseline_days: 24 },
  isochrones: {
    source: {
      osm: { source_url: "https://download.geofabrik.de/x.pbf", osm_data_timestamp: "2026-10-07T20:20:35Z" },
      valhalla_version: "3.8.3",
      walking_speed_kmh: 4.8,
      stations_requested: 50,
      stations_ok: 50,
    },
    failures: [],
  },
};

describe("AboutContent", () => {
  it("always states the core limitations", () => {
    render(<AboutContent quality={{ status: "loading" }} />);
    expect(screen.getByText(/no station-level or origin–destination data/i)).toBeInTheDocument();
    expect(screen.getByText(/boardings, not passengers/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("lists data checks once loaded", () => {
    render(<AboutContent quality={{ status: "ready", data: quality }} />);
    expect(screen.getByText(/2024-02-20/)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-15/)).toBeInTheDocument();
    expect(screen.getByText(/50 of 50 stations/)).toBeInTheDocument();
    expect(screen.getByText(/7 Oct 2026/)).toBeInTheDocument();
  });

  it("shows an error with retry", () => {
    render(<AboutContent quality={{ status: "error", error: "x could not be loaded (HTTP 404)", retry: () => {} }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("HTTP 404");
  });
});
