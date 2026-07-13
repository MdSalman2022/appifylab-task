import Image from "next/image";

export function EventCard() {
  return (
    <article className="mb-4 cursor-pointer overflow-hidden rounded-md bg-white shadow-[0_4px_8px_rgba(0,0,0,0.08)] dark:bg-[#112032]">
      <Image
        src="/assets/images/feed_event1.png"
        alt="People attending the No more terrorism, no more cry event"
        width={528}
        height={320}
        sizes="258px"
        className="h-auto w-full rounded-md object-cover"
      />

      <div className="flex items-center px-4 pb-[14px] pt-5">
        <time
          dateTime="2026-07-10"
          className="shrink-0 rounded-sm bg-[#0acf83] p-2 text-center text-lg leading-[1.1] text-white"
        >
          <span className="block font-bold">10</span>
          <span className="block font-normal">Jul</span>
        </time>
        <h3 className="pb-0 pl-2 pt-[5px] text-base font-medium leading-[1.4] text-black dark:text-white">
          No more terrorism no more cry
        </h3>
      </div>

      <hr className="mb-[10px] mt-1 h-px border-0 bg-[#e7e9ee]" />

      <div className="flex items-center justify-between px-4 pb-3 pt-0.5">
        <p className="text-xs font-medium leading-[18px] text-[#8a8a8a]/70">
          17 People Going
        </p>
        <button
          type="button"
          className="rounded-sm border border-[#1890ff] bg-[#f3f9ff] px-[14px] py-[3px] text-xs font-medium leading-[18px] text-[#1890ff] transition-colors hover:bg-[#1890ff] hover:text-[#f3f9ff] dark:bg-transparent dark:hover:bg-[#1890ff] dark:hover:text-white"
        >
          Going
        </button>
      </div>
    </article>
  );
}
