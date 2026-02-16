import NavbarComponent from "@/components/navbar";
import prisma from "@/lib/prisma";
import Head from "next/head";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { useMemo } from "react";

export default function BlogPost({ post }) {
  if (!post) {
    return (
      <div className="bg-black min-h-screen text-white">
        <NavbarComponent />
        <main className="mx-auto max-w-3xl px-4 py-20">
          <h1 className="text-3xl font-semibold">Post not found</h1>
          <p className="mt-4 text-gray-400">It might have been unpublished. Head back to the archive to explore other posts.</p>
          <Link href="/blogs" className="mt-8 inline-flex text-sm font-semibold text-white underline">Back to blog index</Link>
        </main>
      </div>
    );
  }

  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
  const safeContent = useMemo(
    () =>
      DOMPurify.sanitize(post.content || "", {
        ADD_ATTR: ["style", "class", "data-align"],
        ADD_TAGS: ["figure", "figcaption"],
      }),
    [post.content],
  );

  return (
    <div className="bg-black min-h-screen text-white">
      <Head>
        <title>{post.title} · DevSprint</title>
        <meta name="description" content={post.excerpt ?? post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt ?? post.title} />
        {post.featuredImage ? <meta property="og:image" content={post.featuredImage} /> : null}
      </Head>
      <NavbarComponent />
      <main className="mx-auto max-w-3xl px-4 py-20">
        <Link href="/blogs" className="text-sm text-gray-400 hover:text-white">← All posts</Link>
        <article className="mt-8 space-y-8">
          <header className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{publishedDate ? publishedDate.toLocaleDateString() : "Draft"}</p>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">{post.title}</h1>
              {post.excerpt ? <p className="text-xl text-gray-300">{post.excerpt}</p> : null}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Written by {post.authorName ?? "Anonymous"}</span>
              {publishedDate ? (
                <span>
                  {publishedDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              ) : null}
            </div>
            {post.featuredImage ? (
              <div className="overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="h-80 w-full object-cover"
                />
              </div>
            ) : null}
          </header>

          <article
            className="prose prose-invert max-w-none [&_.float-left]:mr-6 [&_.float-right]:ml-6 [&_img]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        </article>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const slugs = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return {
    paths: slugs.map((post) => ({ params: { slug: post.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
  });

  if (!post || !post.published) {
    return {
      notFound: true,
      revalidate: 10,
    };
  }

  return {
    props: {
      post: {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      },
    },
    revalidate: 60,
  };
}
