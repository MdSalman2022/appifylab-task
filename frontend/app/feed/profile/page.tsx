import { ArrowLeft, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { requireCurrentUser } from "../../_lib/auth/auth-server";
import { resolveAvatarUrl } from "../../_lib/uploads/media-url";
import { FeedShell } from "../_components/feed-shell";

export const metadata = { title: "Profile | BuddyScript" };

export default async function ProfilePage() {
  const user = await requireCurrentUser();

  return (
    <FeedShell user={user}>
      <section className="_feed_inner_area mx-auto mt-4 w-full max-w-[636px] overflow-hidden rounded-md bg-white dark:bg-[#112032] dark:text-white">
        <div className="h-28 bg-[#e4f1fd] dark:bg-[#123150]" />
        <div className="px-6 pb-8">
          <Image
            src={resolveAvatarUrl(user.avatarKey, "/assets/images/profile.png")}
            alt=""
            width={96}
            height={96}
            className="-mt-12 size-24 rounded-full border-4 border-white object-cover dark:border-[#112032]"
          />
          <h1 className="mt-4 text-2xl font-medium">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-black/45 dark:text-white/55">
            <Mail className="size-4" strokeWidth={1.6} />
            {user.email}
          </p>
          <Link
            href="/feed"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-[#1890ff] px-4 py-2 text-sm text-[#1890ff] transition-colors hover:bg-[#1890ff] hover:text-white"
          >
            <ArrowLeft className="size-4" strokeWidth={1.6} />
            Back to feed
          </Link>
        </div>
      </section>
    </FeedShell>
  );
}
