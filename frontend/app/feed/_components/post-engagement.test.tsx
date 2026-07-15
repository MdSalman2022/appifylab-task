import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PostEngagement } from "./post-engagement";

afterEach(cleanup);

function renderEngagement(
  onToggleLike: () => Promise<void>,
  onOpenComments = vi.fn(),
  viewerHasLiked = false,
  likeCount = viewerHasLiked ? 1 : 0,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <PostEngagement
        postId="b3e857a5-bf7a-4ef1-b9d3-91a20f677718"
        likeCount={likeCount}
        commentCount={0}
        viewerHasLiked={viewerHasLiked}
        commentsOpen={false}
        onToggleLike={onToggleLike}
        onOpenComments={onOpenComments}
      />
    </QueryClientProvider>,
  );
}

describe("PostEngagement", () => {
  it("toggles the current user's like", async () => {
    const user = userEvent.setup();
    const onToggleLike = vi.fn().mockResolvedValue(undefined);
    renderEngagement(onToggleLike);

    await user.click(screen.getByRole("button", { name: "Like" }));

    await waitFor(() => expect(onToggleLike).toHaveBeenCalledOnce());
  });

  it("exposes the selected like state", () => {
    renderEngagement(vi.fn().mockResolvedValue(undefined), vi.fn(), true);

    expect(
      screen.getByRole("button", { name: "Like" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("opens the post comments", async () => {
    const user = userEvent.setup();
    const onOpenComments = vi.fn();
    renderEngagement(
      vi.fn().mockResolvedValue(undefined),
      onOpenComments,
    );

    await user.click(screen.getByRole("button", { name: "Comment" }));

    expect(onOpenComments).toHaveBeenCalledOnce();
  });

  it("renders a compact liker preview with the accurate total", () => {
    renderEngagement(
      vi.fn().mockResolvedValue(undefined),
      vi.fn(),
      false,
      7,
    );

    expect(
      screen.getByRole("button", {
        name: "View 7 people who liked this post",
      }),
    ).toBeTruthy();
    expect(screen.getByText("2+")).toBeTruthy();
  });
});
