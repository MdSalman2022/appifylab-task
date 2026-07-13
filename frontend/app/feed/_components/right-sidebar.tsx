import Image from "next/image";
import { Search } from "lucide-react";
import { friends } from "./feed-data";
export function RightSidebar() {
  return (
    <aside className="space-y-4">
      <section className="_feed_inner_area rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
        <div className="mb-6 flex items-center justify-between border-b border-[#eee] pb-5 dark:border-white/20">
          <h2 className="text-xl font-medium">You Might Like</h2>
          <a href="#" className="text-xs text-[#4d72ff]">
            See All
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Image
            src="/assets/images/Avatar.png"
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium dark:text-white">Radovan SkillArena</p>
            <p className="text-xs text-[#74787f] dark:text-white">
              Founder & CEO at Trophy
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button className="h-10 rounded border border-[#f1f1f1] text-sm font-medium text-[#959eae] transition-colors hover:bg-[#377dff] hover:text-white dark:border-[#1890ff] dark:text-white dark:hover:border-[#1890ff] dark:hover:bg-[#1890ff]">
            Ignore
          </button>
          <button className="h-10 rounded bg-[#377dff] font-medium text-white transition-colors hover:bg-[#1890ff]">
            Follow
          </button>
        </div>
      </section>
      <section className="_feed_inner_area rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-medium">Your Friends</h2>
          <a href="#" className="text-xs text-[#4d72ff]">
            See All
          </a>
        </div>
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#777] dark:text-[#1890ff]" />
          <input
            aria-label="Search friends"
            placeholder="input search text"
            className="h-10 w-full rounded-full border-0 bg-[#f5f5f5] pl-11 text-base outline-none dark:bg-[#232e42] dark:text-white dark:placeholder:text-[#8c8f95]"
          />
        </label>
        <div className="mt-7 space-y-[25px]">
          {friends.map((person, index) => (
            <div key={`${person.name}-${index}`} className="flex items-center">
              <Image
                src={`/assets/images/${person.image}`}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <p className="text-sm font-medium dark:text-white">
                  {person.name}
                </p>
                <p className="text-[11px] dark:text-white">
                  {person.role}
                </p>
              </div>
              {person.recent ? (
                <span className="ml-auto text-[11px] text-[#8b8e96] dark:text-[#7e8690]">
                  5 minute ago
                </span>
              ) : (
                <span className="ml-auto size-[10px] rounded-full bg-[#4ac97b]" />
              )}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
