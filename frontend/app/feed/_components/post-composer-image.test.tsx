import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PostComposer } from "./post-composer";

afterEach(cleanup);

describe("PostComposer image uploads", () => {
  it("uploads the selected image before creating the post", async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const onUploadImage = vi
      .fn()
      .mockResolvedValue("users/user-id/posts/image-id.webp");
    render(
      <PostComposer
        onCreate={onCreate}
        onUploadImage={onUploadImage}
      />,
    );
    const file = new File(["image"], "photo.webp", { type: "image/webp" });

    fireEvent.change(screen.getByLabelText("Choose a post image"), {
      target: { files: [file] },
    });
    await user.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(onUploadImage).toHaveBeenCalledWith(file));
    expect(onCreate).toHaveBeenCalledWith({
      imageKey: "users/user-id/posts/image-id.webp",
      visibility: "PUBLIC",
    });
  });
});
