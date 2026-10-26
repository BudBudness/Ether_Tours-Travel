"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EDITOR_EMAIL = "ethertoursandtravel26@gmail.com";

export function ContentEditor() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"tours" | "destinations">("tours");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function refreshSession() {
    const { data } = await supabase.auth.getUser();
    const userEmail = data.user?.email?.toLowerCase() ?? "";
    setEmail(userEmail);
    setSignedIn(Boolean(data.user) && userEmail === EDITOR_EMAIL);
    setLoading(false);
    if (data.user && userEmail !== EDITOR_EMAIL) {
      await supabase.auth.signOut();
      setMessage("This account is not authorised to edit Ether Tours content.");
    }
  }

  async function loadRows(activeTab = tab) {
    setLoading(true);
    setMessage("");
    const table = activeTab === "tours" ? "tours" : "destinations";
    const columns = activeTab === "tours"
      ? "id,slug,title,summary,description,duration_days,duration_nights,status,seo_title,seo_description"
      : "id,name,slug,country_code,summary,description,status";
    const { data, error } = await supabase.from(table).select(columns).order("updated_at", { ascending: false });
    if (error) setMessage(error.message);
    setRows((data ?? []) as Record<string, unknown>[]);
    setSelectedId("");
    setLoading(false);
  }

  useEffect(() => { void refreshSession(); }, []);
  useEffect(() => { if (signedIn) void loadRows(tab); }, [signedIn, tab]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const loginEmail = String(form.get("email") ?? "").trim().toLowerCase();
    if (loginEmail !== EDITOR_EMAIL) {
      setMessage("Use the authorised client email address.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: `${window.location.origin}/admin/content` },
    });
    setMessage(error ? error.message : "A secure sign-in link has been sent if this account is enabled in the authentication project.");
    setLoading(false);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const table = tab === "tours" ? "tours" : "destinations";
    const fields = tab === "tours"
      ? ["slug", "title", "summary", "description", "duration_days", "duration_nights", "status", "seo_title", "seo_description"]
      : ["name", "slug", "country_code", "summary", "description", "status"];
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = form.get(field);
      if (field === "duration_days" || field === "duration_nights") payload[field] = Number(value || 0);
      else payload[field] = String(value ?? "").trim() || null;
    }
    // The client cannot publish. Editing published content returns it to review.
    if (payload.status === "published") payload.status = "review";
    if (tab === "tours") payload.price_on_request = true;
    const { error } = await supabase.from(table).update(payload).eq("id", selectedId);
    setMessage(error ? error.message : "Saved as editable content. A site owner must approve publication.");
    setSaving(false);
    if (!error) await loadRows(tab);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSignedIn(false);
    setRows([]);
    setMessage("Signed out.");
  }

  if (loading && !signedIn) return <main className="min-h-screen bg-[#fbfaf7] px-5 py-20"><div className="mx-auto max-w-xl text-sm text-stone-600">Checking secure access…</div></main>;

  if (!signedIn) return (
    <main className="min-h-screen bg-[#fbfaf7] px-5 py-16 md:py-24">
      <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-7 shadow-sm md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-moss">Ether Tours & Travel</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Content editor</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">Sign in to edit tour and destination information. This area does not provide code, deployment, database administration or enquiry access.</p>
        <form onSubmit={signIn} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">Authorised email
            <input name="email" type="email" defaultValue={EDITOR_EMAIL} required className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-forest" />
          </label>
          <button disabled={loading} className="w-full rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Sending…" : "Email me a secure sign-in link"}</button>
        </form>
        {message && <p role="status" className="mt-4 text-sm leading-6 text-stone-600">{message}</p>}
      </section>
    </main>
  );

  const selected = rows.find(row => row.id === selectedId);
  const fields = tab === "tours"
    ? [{ key: "slug", label: "URL slug" }, { key: "title", label: "Tour title" }, { key: "summary", label: "Short summary", area: true }, { key: "description", label: "Full description", area: true }, { key: "duration_days", label: "Duration (days)", number: true }, { key: "duration_nights", label: "Duration (nights)", number: true }, { key: "seo_title", label: "Search title" }, { key: "seo_description", label: "Search description", area: true }]
    : [{ key: "name", label: "Destination name" }, { key: "slug", label: "URL slug" }, { key: "country_code", label: "Country code (2 letters)" }, { key: "summary", label: "Short summary", area: true }, { key: "description", label: "Description", area: true }];

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.22em] text-moss">Ether Tours & Travel</p><h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Website content</h1><p className="mt-2 text-sm text-stone-600">Signed in as {email}</p></div>
          <button onClick={signOut} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium">Sign out</button>
        </header>
        <div className="mt-8 flex flex-wrap gap-2">
          <button onClick={() => setTab("tours")} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === "tours" ? "bg-forest text-white" : "border border-stone-300 bg-white"}`}>Tours</button>
          <button onClick={() => setTab("destinations")} className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tab === "destinations" ? "bg-forest text-white" : "border border-stone-300 bg-white"}`}>Destinations</button>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.5fr)]">
          <section className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">{tab === "tours" ? "Tour entries" : "Destinations"}</h2><button onClick={() => void loadRows(tab)} className="text-xs font-semibold text-moss">Refresh</button></div>
            {loading ? <p className="py-5 text-sm text-stone-500">Loading content…</p> : rows.length === 0 ? <p className="py-5 text-sm leading-6 text-stone-500">No entries found. The site owner must seed or create catalogue records before they can be edited.</p> : <ul className="mt-3 space-y-2">{rows.map(row => <li key={String(row.id)}><button onClick={() => setSelectedId(String(row.id))} className={`w-full rounded-xl border p-3 text-left ${selectedId === row.id ? "border-forest bg-[#f0ede4]" : "border-stone-200 hover:bg-stone-50"}`}><span className="block font-medium">{String(row.title ?? row.name ?? "Untitled")}</span><span className="mt-1 block text-xs text-stone-500">{String(row.status ?? "draft")} · /{tab === "tours" ? "tours/" : "destinations/"}{String(row.slug ?? "")}</span></button></li>)}</ul>}
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-7">
            <h2 className="text-lg font-semibold">Edit selected content</h2><p className="mt-1 text-sm leading-6 text-stone-500">Changes are saved for owner review. This account cannot publish content.</p>
            {!selected ? <p className="mt-6 text-sm text-stone-500">Select an entry from the list to edit it.</p> : <form key={selectedId + tab} onSubmit={save} className="mt-5 space-y-4">
              {fields.map(field => <label key={field.key} className="block text-sm font-medium">{field.label}{field.area ? <textarea name={field.key} defaultValue={String(selected[field.key] ?? "")} rows={field.key === "description" ? 6 : 3} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal leading-6 outline-none focus:border-forest" /> : <input name={field.key} type={field.number ? "number" : "text"} min={field.number ? 0 : undefined} defaultValue={String(selected[field.key] ?? "")} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-forest" />}</label>)}
              <label className="block text-sm font-medium">Workflow status<select name="status" defaultValue={String(selected.status ?? "draft")} className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-normal"><option value="draft">Draft</option><option value="review">Ready for owner review</option><option value="archived">Archived</option></select></label>
              <button disabled={saving} className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save for review"}</button>
            </form>}
          </section>
        </div>
        {message && <p role="status" className="mt-5 rounded-xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600">{message}</p>}
        <p className="mt-8 text-xs leading-5 text-stone-500">Security boundary: content editing only. Publishing, enquiries, customer data, code, deployment settings and database administration remain outside this client account.</p>
      </div>
    </main>
  );
}
