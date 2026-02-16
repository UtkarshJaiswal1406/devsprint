import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from "@/lib/utils";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === "GET") {
    const includeDrafts = req.query.includeDrafts === "true";
    const whereClause = includeDrafts && session?.user?.role === "admin"
      ? {}
      : { published: true };

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        authorName: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(posts);
  }

  if (req.method === "POST") {
    if (session?.user?.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { title, content, excerpt, featuredImage, authorName, published } = req.body || {};

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const slugBase = slugify(title);
    let slug = slugBase;
    let suffix = 1;

    // Ensure slug uniqueness
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${suffix}`;
      suffix += 1;
    }

    const now = new Date();

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        authorName,
        published: published ?? true,
        publishedAt: published === false ? null : now,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    return res.status(201).json(post);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
