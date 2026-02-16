import NavbarComponent from "@/components/navbar";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default function BlogsIndex({ posts }) {
  return (
    <div className="bg-black min-h-screen text-white">
      <NavbarComponent />
      <main className="max-w-6xl mx-auto px-4 py-20">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-16">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold">Latest posts</h1>
            <p className="mt-4 text-gray-400 max-w-2xl">
              Curated notes, devlogs, and essays. Fresh content appears here as soon as it is published.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Admin dashboard
          </Link>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-2xl font-semibold">No posts yet</h2>
            <p className="mt-2 text-gray-400">Once you publish a post it will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
              >
                {post.featuredImage ? (
                  <div className="overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="h-52 w-full rounded-xl object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-4">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "Draft"}
                    </p>
                    <h2 className="text-2xl font-semibold leading-snug">
                      <Link href={`/blogs/${post.slug}`} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? (
                      <p className="text-gray-300">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-auto flex items-center justify-between text-sm text-gray-400">
                    <span>{post.authorName ?? "Anonymous"}</span>
                    <Link href={`/blogs/${post.slug}`} className="font-semibold text-white hover:underline">
                      Read story →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      authorName: true,
      publishedAt: true,
    },
  });

  const serialisedPosts = posts.map((post) => ({
    ...post,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return {
    props: {
      posts: serialisedPosts,
    },
    revalidate: 60,
  };
}
