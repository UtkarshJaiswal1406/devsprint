import PostEditor from "@/components/admin/post-editor";
import prisma from "@/lib/prisma";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function EditPostPage({ initialPost }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async (form) => {
    if (submitting) return;
    setSubmitting(true);

    const response = await fetch(`/api/blogs/${initialPost.slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setSubmitting(false);
      const { error } = await response.json();
      throw new Error(error || "Failed to update post");
    }

    const data = await response.json();
    if (data.slug !== initialPost.slug) {
      router.replace(`/admin/edit/${data.slug}`);
    } else {
      router.replace(`/admin/edit/${data.slug}?updated=1`);
    }
  };

  const handleDelete = async () => {
    const response = await fetch(`/api/blogs/${initialPost.slug}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete post");
    }

    router.replace("/admin");
  };

  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PostEditor
          mode="edit"
          initialData={initialPost}
          onSubmit={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
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

  const { slug } = context.params;

  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialPost: {
        ...post,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
      },
    },
  };
}
