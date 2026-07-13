import Image from "next/image";
import {
  Bell,
  ChevronDown,
  Home,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
const navigation = [
  { label: "Home", icon: Home, badge: undefined },
  { label: "Friends", icon: Users, badge: undefined },
  { label: "Notifications", icon: Bell, badge: "6" },
  { label: "Messages", icon: MessageCircle, badge: "2" },
];
export function FeedHeader() {
  return (
    <header className="_feed_header fixed inset-x-0 top-0 z-50 h-[74px] border-t-2 border-[#263a30] bg-white dark:bg-[#112032] dark:text-white">
      <div className="!mx-auto flex h-[74px] w-full max-w-[1320px] items-center px-3">
        <a
          href="/feed"
          className="w-[169px] shrink-0"
          aria-label="BuddyScript home"
        >
          <Image
            src="/assets/images/logo.svg"
            alt="BuddyScript"
            width={137}
            height={28}
            className="h-auto w-[137px]"
          />
        </a>
        <form className="relative ml-[112px] w-[424px] shrink-0">
          <Search
            aria-hidden="true"
            className="absolute left-[18px] top-1/2 size-[17px] -translate-y-1/2 text-[#666] dark:text-[#1890ff]"
          />
          <input
            aria-label="Search"
            type="search"
            placeholder="input search text"
            className="h-10 w-full rounded-full border-0 bg-[#f5f5f5] py-2 pl-12 pr-4 text-base outline-none dark:bg-[#232e42] dark:text-white dark:placeholder:text-[#8c8f95]"
          />
        </form>
        <nav
          aria-label="Primary navigation"
          className="ml-auto flex h-full items-center"
        >
          {navigation.map(({ label, icon: Icon, badge }, index) => (
            <a
              key={label}
              href={index === 0 ? "/feed" : "#"}
              aria-label={label}
              className={`relative flex h-full w-[78px] items-center justify-center ${index === 0 ? "border-b-2 border-[#1890ff] text-[#1890ff]" : "text-[#666] dark:text-white"}`}
            >
              <Icon className="size-[23px]" strokeWidth={1.6} />
              {badge && (
                <span className="absolute left-[47px] top-[17px] flex size-4 items-center justify-center rounded-full bg-[#4d72ff] text-[10px] text-white">
                  {badge}
                </span>
              )}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="ml-2 flex shrink-0 items-center gap-2"
          aria-label="Open profile menu"
        >
          <Image
            src="/assets/images/profile.png"
            alt=""
            width={24}
            height={24}
            className="size-6 rounded-full object-cover"
          />
          <span className="text-base text-[#112032] dark:text-white">
            Dylan Field
          </span>
          <ChevronDown className="size-4" />
        </button>
      </div>
    </header>
  );
}
