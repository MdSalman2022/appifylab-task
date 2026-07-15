import Image from "next/image";
import { Plus } from "lucide-react";

const desktopStories = [
  { image: "card_ppl2.png", name: "Ryan Roslansky" },
  { image: "card_ppl3.png", name: "Ryan Roslansky" },
  { image: "card_ppl4.png", name: "Ryan Roslansky" },
] as const;

const mobileStories = [
  { image: "mobile_story_img1.png", active: true },
  { image: "mobile_story_img2.png", active: false },
  { image: "mobile_story_img1.png", active: true },
  { image: "mobile_story_img2.png", active: false },
  { image: "mobile_story_img1.png", active: true },
  { image: "mobile_story_img.png", active: false },
  { image: "mobile_story_img1.png", active: true },
] as const;

export function Stories() {
  return (
    <>
      {/* Desktop story cards (decorative, from the supplied design) */}
      <div className="relative max-lg:hidden">
        <section aria-label="Stories" className="grid grid-cols-4 gap-6">
          <article className="group relative h-[156px] cursor-pointer overflow-hidden rounded-md">
            <Image
              src="/assets/images/card_ppl1.png"
              alt=""
              fill
              loading="eager"
              sizes="141px"
              className="object-cover"
            />
            <div className="absolute inset-0 z-[1] rounded-md bg-black/50" />
            <div className="absolute inset-x-0 bottom-0 z-[2] rounded-t-[25.5px] bg-[#112032] pb-[10px] pt-[30px] text-center">
              <span className="text-xs font-medium leading-[19px] text-white">
                Your Story
              </span>
              <span className="absolute -top-3 left-1/2 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#112032] bg-[#4d8dff] text-white">
                <Plus className="size-[10px]" />
              </span>
            </div>
          </article>
          {desktopStories.map((story, index) => (
            <article
              key={index}
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
              <div className="absolute inset-0 z-[1] rounded-md bg-black/50 transition-colors duration-200 group-hover:bg-black/70" />
              <span className="absolute inset-x-0 bottom-[10px] z-[2] truncate px-2 text-center text-xs font-medium leading-[19px] text-white">
                {story.name}
              </span>
              <Image
                src="/assets/images/mini_pic.png"
                alt=""
                width={28}
                height={28}
                className="absolute right-3 top-3 z-[2] size-7 rounded-full border-2 border-white object-cover"
              />
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

      {/* Mobile story rail (decorative, from the supplied design) */}
      <section
        aria-label="Stories"
        className="_feed_inner_area rounded-md bg-white px-3 pb-1 pt-3 lg:hidden dark:bg-[#112032]"
      >
        <ul className="flex justify-between gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="flex w-14 shrink-0 flex-col items-center gap-1">
            <span className="relative">
              <Image
                src="/assets/images/mobile_story_img.png"
                alt=""
                width={52}
                height={52}
                className="size-[52px] rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-white bg-[#4d8dff] text-white dark:border-[#112032]">
                <Plus className="size-3" />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px] font-medium text-[#1890ff]">
              Your Story
            </span>
          </li>
          {mobileStories.map((story, index) => (
            <li
              key={index}
              className="flex w-14 shrink-0 flex-col items-center gap-1"
            >
              <span
                className={`rounded-full p-0.5 ${
                  story.active
                    ? "border-2 border-[#1890ff]"
                    : "border-2 border-transparent"
                }`}
              >
                <Image
                  src={`/assets/images/${story.image}`}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
              </span>
              <span className="w-full truncate text-center text-[11px] text-[#555b64] dark:text-white/70">
                Ryan...
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
