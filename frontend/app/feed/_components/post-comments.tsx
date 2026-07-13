import Image from "next/image";
import { Heart, Image as ImageIcon, Mic, ThumbsUp } from "lucide-react";

function CommentComposer({ label }: { label: string }) {
  return (
    <form className="flex h-12 items-center rounded-[18px] bg-[#f6f6f6] px-[9px] py-1 dark:bg-[#182a41]">
      <Image
        src="/assets/images/comment_img.png"
        alt=""
        width={26}
        height={26}
        className="size-[26px] shrink-0 rounded-full object-cover"
      />
      <textarea
        aria-label={label}
        placeholder="Write a comment"
        rows={1}
        className="h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-black/45 dark:text-white dark:placeholder:text-white/36"
      />
      <button
        type="button"
        aria-label="Record voice comment"
        className="mx-1 text-black/45 dark:text-white/50"
      >
        <Mic className="size-4" strokeWidth={1.4} />
      </button>
      <button
        type="button"
        aria-label="Attach an image"
        className="mx-1 text-black/45 dark:text-white/50"
      >
        <ImageIcon className="size-4" strokeWidth={1.4} />
      </button>
    </form>
  );
}

export function PostComments() {
  return (
    <>
      <div className="px-6 pb-[10px] pt-6">
        <CommentComposer label="Write a comment on this post" />
      </div>

      <div className="px-6 pb-[10px] pt-6">
        <button
          type="button"
          className="mb-5 text-sm font-semibold leading-[17px] text-[#555b64] dark:text-white/50"
        >
          View 4 previous comments
        </button>

        <div className="flex">
          <Image
            src="/assets/images/txt_img.png"
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full border border-black/10 object-cover"
          />
          <div className="ml-5 min-w-0 flex-1">
            <div className="relative mb-[50px] w-fit max-w-full rounded-[18px] bg-[#f6f6f6] p-3 dark:bg-[#182a41]">
              <h3 className="break-all pr-4 text-sm font-semibold leading-[18px] text-[#112032] dark:text-white">
                Radovan SkillArena
              </h3>
              <p className="mt-1 break-all text-sm leading-[17px] text-[#555b64] dark:text-white/50">
                It is a long established fact that a reader will be distracted
                by the readable content of a page when looking at its layout.
              </p>

              <button
                type="button"
                aria-label="198 reactions"
                className="absolute -bottom-3 right-0 flex items-center rounded-xl bg-white py-0.5 pl-3 pr-2 shadow-[0_8px_24px_rgba(149,157,165,0.2)] dark:bg-[#232e42]"
              >
                <span className="flex items-center">
                  <ThumbsUp className="size-4 text-[#4d8dff]" strokeWidth={2} />
                  <Heart
                    className="-ml-1 size-4 text-red-500"
                    strokeWidth={2}
                  />
                </span>
                <span className="ml-1 mt-[3px] text-sm font-medium leading-[17px] text-[#112032] dark:text-white">
                  198
                </span>
              </button>

              <div className="absolute -bottom-[37px] left-3 flex items-center text-sm font-medium leading-[17px] text-[#112032] dark:text-white">
                <button type="button" className="mr-1 hover:underline">
                  Like.
                </button>
                <button type="button" className="mr-1 hover:underline">
                  Reply.
                </button>
                <button type="button" className="mr-1 hover:underline">
                  Share
                </button>
                <span className="text-[#555b64] dark:text-white/50">.21m</span>
              </div>
            </div>

            <CommentComposer label="Write a reply" />
          </div>
        </div>
      </div>
    </>
  );
}
