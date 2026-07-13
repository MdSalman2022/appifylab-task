import Image from "next/image";
import {
  Bookmark,
  ChartNoAxesColumn,
  Gamepad2,
  Group,
  PlayCircle,
  Save,
  Settings,
  UserRoundPlus,
} from "lucide-react";
import { menuItems, people } from "./feed-data";
import { EventCard } from "./event-card";
const menuIcons = [
  PlayCircle,
  ChartNoAxesColumn,
  UserRoundPlus,
  Bookmark,
  Group,
  Gamepad2,
  Settings,
  Save,
];
export function LeftSidebar() {
  return (
    <aside className="space-y-4">
      <section className="_feed_inner_area rounded-md bg-white px-6 pb-[6px] pt-6 dark:bg-[#112032] dark:text-white">
        <h2 className="mb-6 text-xl font-medium">Explore</h2>
        <ul>
          {menuItems.map((label, index) => {
            const Icon = menuIcons[index];
            return (
              <li
                key={label}
                className="mb-6 flex min-h-6 items-center gap-[14px] text-base font-medium text-[#4f5054] dark:text-white"
              >
                <Icon
                  className="size-5 text-[#666] dark:text-[#7e8690]"
                  strokeWidth={1.5}
                />
                <span>{label}</span>
                {(label === "Learning" || label === "Gaming") && (
                  <span className="ml-auto flex h-6 w-9 items-center justify-center rounded-lg bg-[#0acf83] text-[13px] font-normal leading-[1.4] text-white">
                    New
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="_feed_inner_area rounded-md bg-white p-6 dark:bg-[#112032] dark:text-white">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-medium">Suggested People</h2>
          <a href="#" className="text-xs text-[#4d72ff]">
            See All
          </a>
        </div>
        <div className="space-y-4">
          {people.map((person) => (
            <div key={person.name} className="flex items-center">
              <Image
                src={`/assets/images/${person.image}`}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium dark:text-white">
                  {person.name}
                </p>
                <p className="text-[11px] dark:text-white">
                  {person.role}
                </p>
              </div>
              <button className="ml-auto h-8 rounded-sm border border-[#dcdfe4] px-[7px] text-xs font-medium text-[#959eae] transition-colors hover:border-[#1890ff] hover:bg-[#1890ff] hover:text-[#f3f9ff] dark:border-[#1890ff] dark:bg-transparent dark:text-white dark:hover:bg-[#1890ff]">
                Connect
              </button>
            </div>
          ))}
        </div>
      </section>
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
