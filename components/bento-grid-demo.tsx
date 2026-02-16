import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

type PostPreview = {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
};

const icons = [
  <IconClipboardCopy className="h-4 w-4 text-neutral-500" key="clipboard" />,
  <IconFileBroken className="h-4 w-4 text-neutral-500" key="file" />,
  <IconSignature className="h-4 w-4 text-neutral-500" key="signature" />,
  <IconTableColumn className="h-4 w-4 text-neutral-500" key="table" />,
  <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" key="arrow" />,
  <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" key="top-left" />,
  <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" key="right" />,
];

type GridItem = {
  title: ReactNode;
  description: ReactNode;
  header: ReactNode;
  icon: ReactNode;
  className?: string;
};

export default function BentoGridDemo({ posts = [] }: { posts?: PostPreview[] }) {
  const dynamicItems: GridItem[] = posts.slice(0, 7).map((post, index) => {
    const formattedDate = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

    const description = post.excerpt || (formattedDate ? `Published ${formattedDate}` : "Read this story");

    return {
      title: (
        <Link
          href={`/blogs/${post.slug}`}
          className="inline-flex items-center gap-2 text-neutral-700 transition hover:text-black hover:underline dark:text-neutral-100 dark:hover:text-white"
        >
          {post.title}
        </Link>
      ),
      description,
      header: post.featuredImage ? (
        <ImageHeader imageUrl={post.featuredImage} />
      ) : (
        <Skeleton index={index} />
      ),
      icon: icons[index % icons.length],
      className: index === 0 || index === 3 ? "md:col-span-2" : undefined,
    };
  });

  const gridItems = [...dynamicItems, ...fallbackItems].slice(0, 7);

  return (
    <BentoGrid className="mx-auto max-w-6xl">
      {gridItems.map((item, index) => (
        <BentoGridItem
          key={index}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={item.className}
        />
      ))}
    </BentoGrid>
  );
}

function Skeleton({ index }: { index: number }) {
  const palette = [
    "from-emerald-200 to-emerald-400",
    "from-sky-200 to-sky-400",
    "from-amber-200 to-amber-400",
    "from-purple-200 to-purple-400",
  ];
  return (
    <div
      className={`flex h-full w-full min-h-[6rem] rounded-xl bg-gradient-to-br ${palette[index % palette.length]} dark:from-neutral-900 dark:to-neutral-800`}
    />
  );
}

function ImageHeader({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="relative flex h-full w-full min-h-[6rem] items-end overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="relative z-10 w-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
        Featured
      </span>
    </div>
  );
}

const fallbackItems: GridItem[] = [
  {
    title: "Draft faster",
    description: "Capture ideas as soon as they strike.",
    header: <Skeleton index={0} />,
    icon: icons[0],
  },
  {
    title: "Organize effortlessly",
    description: "Topics and tags keep long-form notes tidy.",
    header: <Skeleton index={1} />,
    icon: icons[1],
  },
  {
    title: "Publish anywhere",
    description: "Deploy to the world with a single click.",
    header: <Skeleton index={2} />,
    icon: icons[2],
  },
  {
    title: "Share securely",
    description: "Private drafts stay private until you hit publish.",
    header: <Skeleton index={3} />,
    icon: icons[3],
  },
  {
    title: "Measure impact",
    description: "Track performance with built-in analytics.",
    header: <Skeleton index={4} />,
    icon: icons[4],
  },
  {
    title: "Collaborate soon",
    description: "Multi-author support landing later this year.",
    header: <Skeleton index={5} />,
    icon: icons[5],
  },
];
