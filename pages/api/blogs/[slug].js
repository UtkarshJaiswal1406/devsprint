import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from "@/lib/utils";

export default async function handler(req, res) {
  const {
    query: { slug },
    method,
  } = req;

  if (!slug || typeof slug !== "string") {
    return res.status(400).json({ error: "Invalid slug" });
  }

  const session = await getServerSession(req, res, authOptions);

  if (method === "GET") {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post || (!post.published && session?.user?.role !== "admin")) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  }

  if (method === "PUT") {
    if (session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

  const { title, content, excerpt, featuredImage, authorName, published } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const existingPost = await prisma.post.findUnique({ where: { slug } });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

  let updatedSlug = slug;

    if (title !== existingPost.title) {
      const newSlugBase = slugify(title);
      updatedSlug = newSlugBase;
      let suffix = 1;
      while (
        updatedSlug !== existingPost.slug &&
        (await prisma.post.findUnique({ where: { slug: updatedSlug } }))
      ) {
        updatedSlug = `${newSlugBase}-${suffix}`;
        suffix += 1;
      }
    }

    const now = new Date();

    let nextPublishedState = typeof published === "boolean" ? published : existingPost.published;
    let nextPublishedAt = existingPost.publishedAt;

    if (nextPublishedState && !nextPublishedAt) {
      nextPublishedAt = now;
    }

    if (!nextPublishedState) {
      nextPublishedAt = null;
    }

    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title,
        slug: updatedSlug,
        content,
        excerpt,
        featuredImage,
        authorName,
        published: nextPublishedState,
        publishedAt: nextPublishedAt,
      },
      select: {
        slug: true,
      },
    });

    return res.status(200).json(updatedPost);
  }

  if (method === "DELETE") {
    if (session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    await prisma.post.delete({ where: { slug } });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
