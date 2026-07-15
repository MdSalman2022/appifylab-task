import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PostComposer } from "./post-composer";

afterEach(cleanup);

describe("PostComposer", () => {
  it("submits trimmed content and the selected visibility", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<PostComposer onCreate={onCreate} />);

    await user.type(screen.getByLabelText("Post content"), "  Hello feed  ");
    await user.click(screen.getByRole("button", { name: "Post visibility" }));
    await user.click(screen.getByRole("option", { name: /Private/ }));
    await user.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        content: "Hello feed",
        visibility: "PRIVATE",
      });
    });
    expect((screen.getByLabelText("Post content") as HTMLTextAreaElement).value).toBe("");
  });

  it("does not submit whitespace-only content", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    render(<PostComposer onCreate={onCreate} />);

    await user.type(screen.getByLabelText("Post content"), "   ");

    expect(
      (screen.getByRole("button", { name: "Post" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(onCreate).not.toHaveBeenCalled();
  });
});
