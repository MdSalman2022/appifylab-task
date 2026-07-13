/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { FeedTheme } from "./feed-theme";

describe("FeedTheme", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("updates the root theme and persists the preference", async () => {
    const user = userEvent.setup();
    document.documentElement.dataset.theme = "light";

    render(
      <FeedTheme>
        <div>Feed</div>
      </FeedTheme>,
    );

    await user.click(screen.getByRole("button"));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");

    await user.click(screen.getByRole("button"));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("theme")).toBe("light");
  });
});
