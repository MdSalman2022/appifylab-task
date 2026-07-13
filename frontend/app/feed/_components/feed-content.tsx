import Image from "next/image";
import { Plus } from "lucide-react";
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
