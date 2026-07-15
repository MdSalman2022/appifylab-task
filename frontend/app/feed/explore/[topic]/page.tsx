import { notFound } from "next/navigation";

import { requireCurrentUser } from "../../../_lib/auth/auth-server";
import { EmptyState } from "../../_components/empty-state";
import { findExploreTopic } from "../../_components/explore-topics";
import { FeedShell } from "../../_components/feed-shell";

type ExplorePageProps = {
  params: Promise<{ topic: string }>;
};

export async function generateMetadata({ params }: ExplorePageProps) {
  const topic = findExploreTopic((await params).topic);
  return { title: `${topic?.label ?? "Explore"} | BuddyScript` };
}

export default async function ExploreTopicPage({ params }: ExplorePageProps) {
  const [user, { topic: slug }] = await Promise.all([
    requireCurrentUser(),
    params,
  ]);
  const topic = findExploreTopic(slug);
  if (!topic) notFound();

  return (
    <FeedShell user={user}>
      <section
        aria-label={topic.label}
        className="_feed_inner_area mx-auto mt-4 w-full max-w-[636px] rounded-md bg-white dark:bg-[#112032] dark:text-white"
      >
        <h1 className="border-b border-black/5 px-6 py-4 text-lg font-medium dark:border-white/10">
          {topic.label}
        </h1>
        <EmptyState
          icon={topic.icon}
          title={topic.emptyTitle}
          description={topic.emptyDescription}
          action={{ href: "/feed", label: "Back to feed" }}
        />
      </section>
    </FeedShell>
  );
}
