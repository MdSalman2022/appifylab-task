import Link from "next/link";
import { EventCard } from "./event-card";
import { exploreTopics } from "./explore-topics";
import { SuggestedPeople } from "./people-panels";

export function LeftSidebar() {
  return (
    <aside className="space-y-4 max-lg:hidden">
      <section className="_feed_inner_area rounded-md bg-white px-6 pb-[6px] pt-6 dark:bg-[#112032] dark:text-white">
        <h2 className="mb-6 text-xl font-medium">Explore</h2>
        <ul>
          {exploreTopics.map(({ slug, label, icon: Icon, isNew }) => (
            <li key={slug} className="mb-6">
              <Link
                href={`/feed/explore/${slug}`}
                className="flex min-h-6 items-center gap-[14px] text-base font-medium text-[#4f5054] transition-colors hover:text-[#1890ff] dark:text-white dark:hover:text-[#1890ff]"
              >
                <Icon
                  className="size-5 text-[#666] dark:text-[#7e8690]"
                  strokeWidth={1.5}
                />
                <span>{label}</span>
                {isNew && (
                  <span className="ml-auto flex h-6 w-9 items-center justify-center rounded-lg bg-[#0acf83] text-[13px] font-normal leading-[1.4] text-white">
                    New
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SuggestedPeople />
      <section className="_feed_inner_area rounded-md bg-white px-6 pb-[6px] pt-6 dark:bg-[#112032] dark:text-white">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-medium">Events</h2>
          <a
            href="#"
            className="px-px py-[5px] text-xs font-medium leading-[18px] text-[#4d72ff]"
          >
            See all
          </a>
        </div>
        <EventCard />
        <EventCard />
      </section>
    </aside>
  );
}
