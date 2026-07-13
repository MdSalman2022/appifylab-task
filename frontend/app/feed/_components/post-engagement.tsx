import Image from "next/image";
import { Forward, MessageSquareText } from "lucide-react";
import { PostComments } from "./post-comments";

const recentReactions = [
  { id: "reaction-1", imageUrl: "/assets/images/react_img1.png" },
  { id: "reaction-2", imageUrl: "/assets/images/react_img2.png" },
  { id: "reaction-3", imageUrl: "/assets/images/react_img3.png" },
  { id: "reaction-4", imageUrl: "/assets/images/react_img4.png" },
  { id: "reaction-5", imageUrl: "/assets/images/react_img5.png" },
] as const;

function HahaIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 19 19" className="size-[19px]">
      <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19Z" />
      <path
        fill="#664500"
        d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527Z"
      />
      <path
        fill="#fff"
        d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11Z"
      />
      <path
        fill="#664500"
        d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847ZM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847Z"
      />
    </svg>
  );
}

export function PostEngagement() {
  return (
    <>
      <div className="mb-[26px] flex items-center justify-between px-6">
        <div className="flex cursor-pointer items-center">
          {recentReactions.map((reaction, index) => (
            <Image
              key={reaction.id}
              src={reaction.imageUrl}
              alt=""
              width={32}
              height={32}
              className={`size-8 rounded-full border border-white object-cover ${index === 0 ? "" : "-ml-4"}`}
            />
          ))}
          <span className="-ml-4 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#4d8dff] text-sm text-white">
            9+
          </span>
        </div>
        <div className="flex gap-4 text-sm text-black/45 dark:text-white/46">
          <button type="button">
            <span className="text-[#112032] dark:text-white">12</span>{" "}
            Comment
          </button>
          <button type="button">
            <span className="text-[#112032] dark:text-white">122</span>{" "}
            Share
          </button>
        </div>
      </div>

      <div className="flex bg-[#fbfcfd] p-2 dark:bg-[#11263c]">
        <button
          type="button"
          className="mr-1 flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#e4f1fd] text-sm transition-colors hover:bg-[#e4f1fd] dark:bg-[#123150] dark:hover:bg-[#123150]"
        >
          <HahaIcon />
          Haha
        </button>
        <button
          type="button"
          className="mr-1 flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors hover:bg-[#e4f1fd] dark:hover:bg-[#123150]"
        >
          <MessageSquareText className="size-[21px]" strokeWidth={1.3} />
          Comment
        </button>
        <button
          type="button"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md text-sm transition-colors hover:bg-[#e4f1fd] dark:hover:bg-[#123150]"
        >
          <Forward className="size-6" strokeWidth={1.3} />
          Share
        </button>
      </div>
      <PostComments />
    </>
  );
}
