import Link from "next/link";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";
import { signOut } from "next-auth/react";

export default function AdminDashboard({ posts }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Admin dashboard</h1>
            <p className="text-sm text-gray-400">Create, edit, and manage your posts.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-white/40 hover:text-white"
            >
              View site
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 space-y-12">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Write something new</h2>
            <p className="text-sm text-gray-400">
              Draft in private, publish when you are ready. You can always edit later.
            </p>
          </div>
          <Link
            href="/admin/new"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
          >
            Create post
          </Link>
        </div>

        <section className="space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All posts</h2>
            <span className="text-sm text-gray-400">{posts.length} posts</span>
          </header>

          {posts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
              Nothing here yet. Create your first post to get started.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {posts.map((post) => (
                    <tr key={post.slug} className="hover:bg-white/5">
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-white">{post.title}</p>
                          <p className="text-xs text-gray-500">/{post.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {post.published ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-400">
                        {new Date(post.updatedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/admin/edit/${post.slug}`}
                            className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40"
                          >
                            Edit
                          </Link>
                          {post.published ? (
                            <Link
                              href={`/blogs/${post.slug}`}
                              className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:border-white/40"
                            >
                              View
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session?.user?.role !== "admin") {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  const posts = await prisma.post.findMany({
    orderBy: [
      { updatedAt: "desc" },
    ],
  });

  return {
    props: {
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        published: post.published,
        updatedAt: post.updatedAt.toISOString(),
      })),
    },
  };
}
