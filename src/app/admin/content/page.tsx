import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContentEditor } from "@/components/content-editor";

export const metadata = { title: "Website Content Editor | Ether Tours & Travel", robots: { index: false, follow: false } };

export default async function AdminContentPage() {
  const supabase = await createClient();
  let allowed = false;
  try {
    const { data } = await supabase.auth.getUser();
    allowed = data.user?.email?.toLowerCase() === "ethertoursandtravel26@gmail.com";
  } catch {
    // The client component explains missing environment/auth setup without exposing private data.
  }
  if (allowed) return <ContentEditor />;
  return <ContentEditor />;
}
