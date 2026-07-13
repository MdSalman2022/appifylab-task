import Image from "next/image";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Video,
} from "lucide-react";
import { PostEngagement } from "./post-engagement";
const stories = [
  { image: "card_ppl1.png", label: "Your Story", own: true },
  { image: "card_ppl2.png", label: "Ryan Roslansky" },
  { image: "card_ppl3.png", label: "Ryan Roslansky" },
  { image: "card_ppl4.png", label: "Ryan Roslansky" },
];
export function Stories() {
  return (
    <div className="relative">
      <section className="grid grid-cols-4 gap-6">
        {stories.map((story) => (
          <article
            key={story.image}
            className="group relative h-[156px] cursor-pointer overflow-hidden rounded-md"
          >
            <Image
              src={`/assets/images/${story.image}`}
              alt=""
              fill
              loading="eager"
              sizes="141px"
              className="object-cover"
            />
            <div
              className={`absolute inset-0 z-[1] rounded-md bg-black/50 transition-colors duration-200 ${
                story.own ? "" : "group-hover:bg-black/70"
              }`}
            />
            {story.own ? (
              <div className="absolute inset-x-0 bottom-0 z-[2] rounded-t-[25.5px] bg-[#112032] pb-[10px] pt-[30px] text-center">
                <span className="text-xs font-medium leading-[19px] text-white">
                  {story.label}
                </span>
                <span className="absolute -top-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#112032] bg-[#4d8dff] text-white">
                  <Plus className="size-[10px]" />
                </span>
              </div>
            ) : (
              <>
                <span className="absolute inset-x-0 bottom-[10px] z-[2] text-center text-xs font-medium leading-[19px] text-white">
                  {story.label}
                </span>
                <Image
                  src="/assets/images/mini_pic.png"
                  alt=""
                  width={28}
                  height={28}
                  className="absolute right-3 top-3 z-[2] size-7 rounded-full border-2 border-white object-cover"
                />
              </>
            )}
          </article>
        ))}
      </section>
      <button
        type="button"
        aria-label="View more stories"
        className="absolute -right-[5px] top-1/2 z-[18] flex size-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#f0f2f5] bg-[#1890ff] dark:border-[#232e42]"
      >
        <svg aria-hidden="true" width="9" height="8" viewBox="0 0 9 8">
          <path
            fill="#fff"
            d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z"
          />
        </svg>
      </button>
    </div>
  );
}
export function PostComposer() {
  return (
    <section className="_feed_inner_area mt-4 rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
      <div className="flex items-center gap-3">
        <Image
          src="/assets/images/txt_img.png"
          alt=""
          width={36}
          height={36}
          className="size-9 rounded-full object-cover"
        />
        <button
          type="button"
          className="flex items-center gap-2 text-base text-[#595b61] dark:text-white/46"
        >
          Write something ... <Pencil className="size-5" />
        </button>
      </div>
      <div className="mt-[58px] flex h-16 items-center bg-[#f5f8ff] px-6 dark:bg-[#11263c]">
        <div className="flex items-center gap-6 text-[#555b64] dark:text-white/46">
          <button className="flex items-center gap-2">
            <ImageIcon className="size-5" />
            Photo
          </button>
          <button className="flex items-center gap-2">
            <Video className="size-5" />
            Video
          </button>
          <button className="flex items-center gap-2">
            <CalendarDays className="size-5" />
            Event
          </button>
          <button className="flex items-center gap-2">
            <FileText className="size-5" />
            Article
          </button>
        </div>
        <button className="ml-auto flex h-12 w-[102px] items-center justify-center gap-2 rounded bg-[#1890ff] font-medium text-white transition-colors hover:bg-[#377dff]">
          <Send className="size-4" />
          Post
        </button>
      </div>
    </section>
  );
}
export function FeedPost() {
  return (
    <article className="_feed_inner_area mt-4 overflow-hidden rounded-md bg-white pb-6 dark:bg-[#112032] dark:text-white">
      <div className="px-6 pt-6">
        <header className="flex items-center">
          <Image
            src="/assets/images/post_img.png"
            alt=""
            width={44}
            height={44}
            className="size-11 rounded-full object-cover"
          />
          <div className="ml-3">
            <h2 className="font-medium">Karim Saif</h2>
            <p className="text-sm text-[#8a8e98] dark:text-white/46">
              5 minute ago . Public
            </p>
          </div>
          <button aria-label="Post options" className="ml-auto">
            <MoreVertical className="size-5 text-[#aaa] dark:text-white/46" />
          </button>
        </header>
        <p className="my-4 text-sm">-Healthy Tracking App</p>
        <Image
          src="/assets/images/timeline_img.png"
          alt="Healthy tracking app"
          width={588}
          height={430}
          className="mb-6 h-auto w-full rounded-md object-cover"
          priority
        />
      </div>
      <PostEngagement />
    </article>
  );
}
