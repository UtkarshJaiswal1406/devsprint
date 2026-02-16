import PostEditor from "@/components/admin/post-editor";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useState } from "react";

export default function NewPostPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (form) => {
    if (submitting) return;
    setSubmitting(true);

    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setSubmitting(false);
      const { error } = await response.json();
      throw new Error(error || "Failed to create post");
    }

    const data = await response.json();
    router.replace(`/admin/edit/${data.slug}`);
  };

  return (
    <div className="bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <PostEditor mode="create" onSubmit={handleCreate} />
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

  return {
    props: {},
  };
}
