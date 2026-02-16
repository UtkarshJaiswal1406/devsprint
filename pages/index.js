import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import NavbarComponent from "@/components/navbar";
import BentoGridDemo from "@/components/bento-grid-demo";
import prisma from "@/lib/prisma";

export default function Home({ posts }) {
  return (
    <div className="bg-black">
    <div className="relative">
      <NavbarComponent />
      <HeroHighlight>
        <h1 className="text-4xl px-4 md:text-6xl lg:text-7xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto">
          Dev
          <Highlight className="text-black dark:text-white">
            Sprint.
          </Highlight>
        </h1>
        <h3 className="text-xl px-4 md:text-2xl lg:text-xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center mx-auto">
          Devlogs, simplified.
        </h3>
      </HeroHighlight>
    </div>
    
    {/* Bento Grid Section */}
    <div className="py-20 px-4">
      <BentoGridDemo posts={posts} />
    </div>
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
    take: 7,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
    },
  });

  const serializedPosts = posts.map((post) => ({
    ...post,
    excerpt: post.excerpt ?? null,
    featuredImage: post.featuredImage ?? null,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return {
    props: {
      posts: serializedPosts,
    },
    revalidate: 60,
  };
}
