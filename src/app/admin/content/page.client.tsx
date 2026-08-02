"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AdminField,
  AdminNav,
  LocaleTabs,
  SaveBar,
} from "@/components/AdminShell";
import type { SiteContent } from "@/lib/content.types";
import { cn } from "@/lib/utils";

type Tab =
  | "newsletter"
  | "blog"
  | "contest"
  | "regulament"
  | "hero"
  | "about"
  | "photowalks"
  | "termeni"
  | "privacy"
  | "membership"
  | "shop";

const TABS: { id: Tab; label: string }[] = [
  { id: "newsletter", label: "Newsletter" },
  { id: "blog", label: "Blog" },
  { id: "contest", label: "Concurs" },
  { id: "regulament", label: "Regulament" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "Despre" },
  { id: "photowalks", label: "Photowalks" },
  { id: "termeni", label: "Termeni" },
  { id: "privacy", label: "Confidențialitate" },
  { id: "membership", label: "Membership" },
  { id: "shop", label: "Magazin" },
];

export default function AdminContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "newsletter";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [locale, setLocale] = useState<"ro" | "en">("ro");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/content");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    setContent(data.content);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = searchParams.get("tab") as Tab | null;
    if (t && TABS.some((x) => x.id === t)) setTab(t);
  }, [searchParams]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  async function saveSection(section: keyof SiteContent) {
    if (!content) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data: content[section] }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Eroare la salvare");
      return;
    }
    const data = await res.json();
    setContent(data.content);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading || !content) {
    return (
      <div className="min-h-screen">
        <AdminNav title="Conținut site" onLogout={logout} />
        <p className="p-8 text-ink-400">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <AdminNav
        title="Editor conținut"
        subtitle="Modificările apar imediat pe site după salvare"
        onLogout={logout}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8 border-b border-ink-800 pb-4">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "px-3 py-2 text-sm rounded-sm border transition-colors",
                tab === id
                  ? "border-signal bg-signal/10 text-cream"
                  : "border-ink-800 text-ink-400 hover:border-ink-600"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {!["contest", "photowalks", "shop"].includes(tab) ? (
          <LocaleTabs locale={locale} onChange={setLocale} />
        ) : null}

        {tab === "newsletter" && (
          <section className="space-y-4">
            <AdminField
              label="Titlu secțiune"
              value={content.newsletter[locale].title}
              onChange={(v) =>
                setContent({
                  ...content,
                  newsletter: {
                    ...content.newsletter,
                    [locale]: { ...content.newsletter[locale], title: v },
                  },
                })
              }
            />
            <AdminField
              label="Descriere"
              value={content.newsletter[locale].body}
              onChange={(v) =>
                setContent({
                  ...content,
                  newsletter: {
                    ...content.newsletter,
                    [locale]: { ...content.newsletter[locale], body: v },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Placeholder email"
              value={content.newsletter[locale].emailPlaceholder}
              onChange={(v) =>
                setContent({
                  ...content,
                  newsletter: {
                    ...content.newsletter,
                    [locale]: { ...content.newsletter[locale], emailPlaceholder: v },
                  },
                })
              }
            />
            <AdminField
              label="Subiect email"
              value={content.newsletter[locale].subject}
              onChange={(v) =>
                setContent({
                  ...content,
                  newsletter: {
                    ...content.newsletter,
                    [locale]: { ...content.newsletter[locale], subject: v },
                  },
                })
              }
            />
            <AdminField
              label="Email contact"
              value={content.newsletter[locale].contactEmail}
              onChange={(v) =>
                setContent({
                  ...content,
                  newsletter: {
                    ...content.newsletter,
                    [locale]: { ...content.newsletter[locale], contactEmail: v },
                  },
                })
              }
            />
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("newsletter")}
            />
          </section>
        )}

        {tab === "blog" && (
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-lg text-cream">Pagina blog</h2>
              <AdminField
                label="Titlu pagină"
                value={content.blog[locale].pageTitle}
                onChange={(v) =>
                  setContent({
                    ...content,
                    blog: {
                      ...content.blog,
                      [locale]: { ...content.blog[locale], pageTitle: v },
                    },
                  })
                }
              />
              <AdminField
                label="Descriere pagină"
                value={content.blog[locale].pageBody}
                onChange={(v) =>
                  setContent({
                    ...content,
                    blog: {
                      ...content.blog,
                      [locale]: { ...content.blog[locale], pageBody: v },
                    },
                  })
                }
                multiline
              />
              <SaveBar
                saving={saving}
                saved={saved}
                error={error}
                onSave={() => saveSection("blog")}
              />
            </div>

            <div className="border-t border-ink-800 pt-8 space-y-6">
              <h2 className="font-display text-lg text-cream">
                Articole ({locale.toUpperCase()})
              </h2>
              {content.articles.map((article, index) => (
                <div
                  key={article.id}
                  className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-signal/80 font-medium">
                      {article.id} · {article.categorySlug} · {article.date}
                    </p>
                    <label className="flex items-center gap-2 text-sm text-ink-400">
                      <input
                        type="checkbox"
                        checked={article.published}
                        onChange={(e) => {
                          const articles = [...content.articles];
                          articles[index] = { ...article, published: e.target.checked };
                          setContent({ ...content, articles });
                        }}
                        className="rounded border-ink-600"
                      />
                      Publicat
                    </label>
                  </div>
                  <AdminField
                    label="Titlu"
                    value={article[locale].title}
                    onChange={(v) => {
                      const articles = [...content.articles];
                      articles[index] = {
                        ...article,
                        [locale]: { ...article[locale], title: v },
                      };
                      setContent({ ...content, articles });
                    }}
                  />
                  <AdminField
                    label="Excerpt"
                    value={article[locale].excerpt}
                    onChange={(v) => {
                      const articles = [...content.articles];
                      articles[index] = {
                        ...article,
                        [locale]: { ...article[locale], excerpt: v },
                      };
                      setContent({ ...content, articles });
                    }}
                    multiline
                    rows={2}
                  />
                  <AdminField
                    label="Conținut complet (opțional)"
                    value={article[locale].body}
                    onChange={(v) => {
                      const articles = [...content.articles];
                      articles[index] = {
                        ...article,
                        [locale]: { ...article[locale], body: v },
                      };
                      setContent({ ...content, articles });
                    }}
                    multiline
                    rows={6}
                  />
                </div>
              ))}
              <SaveBar
                saving={saving}
                saved={saved}
                error={error}
                onSave={() => saveSection("articles")}
              />
            </div>
          </section>
        )}

        {tab === "contest" && (
          <section className="space-y-4">
            <LocaleTabs locale={locale} onChange={setLocale} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AdminField
                label="Nr. temă"
                value={String(content.contest.active.themeNumber)}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contest: {
                      active: {
                        ...content.contest.active,
                        themeNumber: Number(v) || 1,
                      },
                    },
                  })
                }
              />
              <AdminField
                label="Deadline (YYYY-MM-DD)"
                value={content.contest.active.deadline}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contest: {
                      active: { ...content.contest.active, deadline: v },
                    },
                  })
                }
              />
              <AdminField
                label="Nr. înscrieri"
                value={String(content.contest.active.submissions)}
                onChange={(v) =>
                  setContent({
                    ...content,
                    contest: {
                      active: {
                        ...content.contest.active,
                        submissions: Number(v) || 0,
                      },
                    },
                  })
                }
              />
            </div>
            <AdminField
              label="Subiect email trimitere"
              value={content.contest.active.uploadSubject}
              onChange={(v) =>
                setContent({
                  ...content,
                  contest: {
                    active: { ...content.contest.active, uploadSubject: v },
                  },
                })
              }
            />
            <AdminField
              label="Titlu concurs"
              value={content.contest.active[locale].title}
              onChange={(v) =>
                setContent({
                  ...content,
                  contest: {
                    active: {
                      ...content.contest.active,
                      [locale]: { ...content.contest.active[locale], title: v },
                    },
                  },
                })
              }
            />
            <AdminField
              label="Temă / brief"
              value={content.contest.active[locale].theme}
              onChange={(v) =>
                setContent({
                  ...content,
                  contest: {
                    active: {
                      ...content.contest.active,
                      [locale]: { ...content.contest.active[locale], theme: v },
                    },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Premiu"
              value={content.contest.active[locale].prize}
              onChange={(v) =>
                setContent({
                  ...content,
                  contest: {
                    active: {
                      ...content.contest.active,
                      [locale]: { ...content.contest.active[locale], prize: v },
                    },
                  },
                })
              }
            />
            <AdminField
              label="Text pagină concurs"
              value={content.contest.active[locale].pageBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  contest: {
                    active: {
                      ...content.contest.active,
                      [locale]: { ...content.contest.active[locale], pageBody: v },
                    },
                  },
                })
              }
              multiline
            />
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("contest")}
            />
          </section>
        )}

        {tab === "regulament" && (
          <section className="space-y-4">
            <AdminField
              label="Titlu pagină"
              value={content.contestRules[locale].pageTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  contestRules: {
                    ...content.contestRules,
                    [locale]: { ...content.contestRules[locale], pageTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Introducere"
              value={content.contestRules[locale].pageBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  contestRules: {
                    ...content.contestRules,
                    [locale]: { ...content.contestRules[locale], pageBody: v },
                  },
                })
              }
              multiline
            />
            {content.contestRules[locale].sections.map((section, index) => (
              <div
                key={`${section.title}-${index}`}
                className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
              >
                <AdminField
                  label={`Secțiune ${index + 1} — titlu`}
                  value={section.title}
                  onChange={(v) => {
                    const sections = [...content.contestRules[locale].sections];
                    sections[index] = { ...section, title: v };
                    setContent({
                      ...content,
                      contestRules: {
                        ...content.contestRules,
                        [locale]: {
                          ...content.contestRules[locale],
                          sections,
                        },
                      },
                    });
                  }}
                />
                <AdminField
                  label="Text"
                  value={section.body}
                  onChange={(v) => {
                    const sections = [...content.contestRules[locale].sections];
                    sections[index] = { ...section, body: v };
                    setContent({
                      ...content,
                      contestRules: {
                        ...content.contestRules,
                        [locale]: {
                          ...content.contestRules[locale],
                          sections,
                        },
                      },
                    });
                  }}
                  multiline
                  rows={5}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const sections = [
                  ...content.contestRules[locale].sections,
                  { title: "Secțiune nouă", body: "" },
                ];
                setContent({
                  ...content,
                  contestRules: {
                    ...content.contestRules,
                    [locale]: { ...content.contestRules[locale], sections },
                  },
                });
              }}
              className="text-sm text-signal hover:text-signal-light"
            >
              + Adaugă secțiune
            </button>
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("contestRules")}
            />
          </section>
        )}

        {tab === "hero" && (
          <section className="space-y-4">
            <AdminField
              label="Text principal hero"
              value={content.hero[locale].body}
              onChange={(v) =>
                setContent({
                  ...content,
                  hero: {
                    ...content.hero,
                    [locale]: { ...content.hero[locale], body: v },
                  },
                })
              }
              multiline
              rows={5}
            />
            <AdminField
              label="CTA Photowalk"
              value={content.hero[locale].ctaWalk}
              onChange={(v) =>
                setContent({
                  ...content,
                  hero: {
                    ...content.hero,
                    [locale]: { ...content.hero[locale], ctaWalk: v },
                  },
                })
              }
            />
            <AdminField
              label="CTA Concurs"
              value={content.hero[locale].ctaContest}
              onChange={(v) =>
                setContent({
                  ...content,
                  hero: {
                    ...content.hero,
                    [locale]: { ...content.hero[locale], ctaContest: v },
                  },
                })
              }
            />
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("hero")}
            />
          </section>
        )}

        {tab === "about" && (
          <section className="space-y-4">
            <AdminField
              label="Introducere"
              value={content.about[locale].pageBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  about: {
                    ...content.about,
                    [locale]: { ...content.about[locale], pageBody: v },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Misiune"
              value={content.about[locale].missionBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  about: {
                    ...content.about,
                    [locale]: { ...content.about[locale], missionBody: v },
                  },
                })
              }
              multiline
              rows={5}
            />
            <AdminField
              label="Cum funcționează"
              value={content.about[locale].howBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  about: {
                    ...content.about,
                    [locale]: { ...content.about[locale], howBody: v },
                  },
                })
              }
              multiline
              rows={5}
            />
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("about")}
            />
          </section>
        )}

        {tab === "photowalks" && (
          <section className="space-y-6">
            <LocaleTabs locale={locale} onChange={setLocale} />
            {content.photowalks.map((walk, index) => (
              <div
                key={walk.id}
                className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
              >
                <p className="text-sm text-signal/80 font-medium">
                  {walk.id} · {walk.date} · {walk.participantCount} participanți
                </p>
                <AdminField
                  label="Titlu"
                  value={walk[locale].title}
                  onChange={(v) => {
                    const photowalks = [...content.photowalks];
                    photowalks[index] = {
                      ...walk,
                      [locale]: { ...walk[locale], title: v },
                    };
                    setContent({ ...content, photowalks });
                  }}
                />
                <AdminField
                  label="Temă"
                  value={walk[locale].theme}
                  onChange={(v) => {
                    const photowalks = [...content.photowalks];
                    photowalks[index] = {
                      ...walk,
                      [locale]: { ...walk[locale], theme: v },
                    };
                    setContent({ ...content, photowalks });
                  }}
                />
                <AdminField
                  label="Format întâlnire"
                  value={walk[locale].location}
                  onChange={(v) => {
                    const photowalks = [...content.photowalks];
                    photowalks[index] = {
                      ...walk,
                      [locale]: { ...walk[locale], location: v },
                    };
                    setContent({ ...content, photowalks });
                  }}
                />
                <AdminField
                  label="Descriere"
                  value={walk[locale].description}
                  onChange={(v) => {
                    const photowalks = [...content.photowalks];
                    photowalks[index] = {
                      ...walk,
                      [locale]: { ...walk[locale], description: v },
                    };
                    setContent({ ...content, photowalks });
                  }}
                  multiline
                  rows={4}
                />
                <div className="grid grid-cols-2 gap-4">
                  <AdminField
                    label="Dată (YYYY-MM-DD)"
                    value={walk.date}
                    onChange={(v) => {
                      const photowalks = [...content.photowalks];
                      photowalks[index] = { ...walk, date: v };
                      setContent({ ...content, photowalks });
                    }}
                  />
                  <AdminField
                    label="Participanți"
                    value={String(walk.participantCount)}
                    onChange={(v) => {
                      const photowalks = [...content.photowalks];
                      photowalks[index] = {
                        ...walk,
                        participantCount: Number(v) || 0,
                      };
                      setContent({ ...content, photowalks });
                    }}
                  />
                </div>
              </div>
            ))}
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("photowalks")}
            />
          </section>
        )}

        {tab === "termeni" && (
          <section className="space-y-4">
            <AdminField
              label="Titlu pagină"
              value={content.terms[locale].pageTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  terms: {
                    ...content.terms,
                    [locale]: { ...content.terms[locale], pageTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Data actualizare"
              value={content.terms[locale].updated}
              onChange={(v) =>
                setContent({
                  ...content,
                  terms: {
                    ...content.terms,
                    [locale]: { ...content.terms[locale], updated: v },
                  },
                })
              }
            />
            <AdminField
              label="Introducere"
              value={content.terms[locale].intro}
              onChange={(v) =>
                setContent({
                  ...content,
                  terms: {
                    ...content.terms,
                    [locale]: { ...content.terms[locale], intro: v },
                  },
                })
              }
              multiline
            />
            {content.terms[locale].sections.map((section, index) => (
              <div
                key={`terms-${index}`}
                className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
              >
                <AdminField
                  label={`Secțiune ${index + 1}`}
                  value={section.title}
                  onChange={(v) => {
                    const sections = [...content.terms[locale].sections];
                    sections[index] = { ...section, title: v };
                    setContent({
                      ...content,
                      terms: {
                        ...content.terms,
                        [locale]: { ...content.terms[locale], sections },
                      },
                    });
                  }}
                />
                <AdminField
                  label="Text"
                  value={section.body}
                  onChange={(v) => {
                    const sections = [...content.terms[locale].sections];
                    sections[index] = { ...section, body: v };
                    setContent({
                      ...content,
                      terms: {
                        ...content.terms,
                        [locale]: { ...content.terms[locale], sections },
                      },
                    });
                  }}
                  multiline
                  rows={4}
                />
              </div>
            ))}
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("terms")}
            />
          </section>
        )}

        {tab === "privacy" && (
          <section className="space-y-4">
            <AdminField
              label="Titlu pagină"
              value={content.privacy[locale].pageTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  privacy: {
                    ...content.privacy,
                    [locale]: { ...content.privacy[locale], pageTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Introducere"
              value={content.privacy[locale].intro}
              onChange={(v) =>
                setContent({
                  ...content,
                  privacy: {
                    ...content.privacy,
                    [locale]: { ...content.privacy[locale], intro: v },
                  },
                })
              }
              multiline
            />
            {content.privacy[locale].sections.map((section, index) => (
              <div
                key={`privacy-${index}`}
                className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
              >
                <AdminField
                  label={`Secțiune ${index + 1}`}
                  value={section.title}
                  onChange={(v) => {
                    const sections = [...content.privacy[locale].sections];
                    sections[index] = { ...section, title: v };
                    setContent({
                      ...content,
                      privacy: {
                        ...content.privacy,
                        [locale]: { ...content.privacy[locale], sections },
                      },
                    });
                  }}
                />
                <AdminField
                  label="Text"
                  value={section.body}
                  onChange={(v) => {
                    const sections = [...content.privacy[locale].sections];
                    sections[index] = { ...section, body: v };
                    setContent({
                      ...content,
                      privacy: {
                        ...content.privacy,
                        [locale]: { ...content.privacy[locale], sections },
                      },
                    });
                  }}
                  multiline
                  rows={4}
                />
              </div>
            ))}
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("privacy")}
            />
          </section>
        )}

        {tab === "membership" && (
          <section className="space-y-6">
            <AdminField
              label="Titlu pagină"
              value={content.membership[locale].pageTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  membership: {
                    ...content.membership,
                    [locale]: { ...content.membership[locale], pageTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Text pagină"
              value={content.membership[locale].pageBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  membership: {
                    ...content.membership,
                    [locale]: { ...content.membership[locale], pageBody: v },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Titlu secțiune homepage"
              value={content.membership[locale].sectionTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  membership: {
                    ...content.membership,
                    [locale]: { ...content.membership[locale], sectionTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Text secțiune homepage"
              value={content.membership[locale].sectionBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  membership: {
                    ...content.membership,
                    [locale]: { ...content.membership[locale], sectionBody: v },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Subiect email înscriere"
              value={content.membership[locale].joinSubject}
              onChange={(v) =>
                setContent({
                  ...content,
                  membership: {
                    ...content.membership,
                    [locale]: { ...content.membership[locale], joinSubject: v },
                  },
                })
              }
            />
            <div className="space-y-3">
              <p className="text-sm text-ink-400">Carduri homepage</p>
              {content.membership[locale].homepageCards.map((card, index) => (
                <div
                  key={index}
                  className="p-4 bg-ink-900 border border-ink-800 rounded-lg grid gap-3 sm:grid-cols-2"
                >
                  <AdminField
                    label="Preț"
                    value={card.price}
                    onChange={(v) => {
                      const homepageCards = [...content.membership[locale].homepageCards];
                      homepageCards[index] = { ...card, price: v };
                      setContent({
                        ...content,
                        membership: {
                          ...content.membership,
                          [locale]: { ...content.membership[locale], homepageCards },
                        },
                      });
                    }}
                  />
                  <AdminField
                    label="Beneficii"
                    value={card.features}
                    onChange={(v) => {
                      const homepageCards = [...content.membership[locale].homepageCards];
                      homepageCards[index] = { ...card, features: v };
                      setContent({
                        ...content,
                        membership: {
                          ...content.membership,
                          [locale]: { ...content.membership[locale], homepageCards },
                        },
                      });
                    }}
                  />
                </div>
              ))}
            </div>
            {(["free", "community", "patron"] as const).map((tierKey) => {
              const tier = content.membership[locale].tiers[tierKey];
              return (
                <div
                  key={tierKey}
                  className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
                >
                  <p className="text-sm text-signal/80 font-medium uppercase">{tierKey}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <AdminField
                      label="Nume plan"
                      value={tier.name}
                      onChange={(v) =>
                        setContent({
                          ...content,
                          membership: {
                            ...content.membership,
                            [locale]: {
                              ...content.membership[locale],
                              tiers: {
                                ...content.membership[locale].tiers,
                                [tierKey]: { ...tier, name: v },
                              },
                            },
                          },
                        })
                      }
                    />
                    <AdminField
                      label="Preț"
                      value={tier.price}
                      onChange={(v) =>
                        setContent({
                          ...content,
                          membership: {
                            ...content.membership,
                            [locale]: {
                              ...content.membership[locale],
                              tiers: {
                                ...content.membership[locale].tiers,
                                [tierKey]: { ...tier, price: v },
                              },
                            },
                          },
                        })
                      }
                    />
                  </div>
                  <AdminField
                    label="Perioadă"
                    value={tier.period}
                    onChange={(v) =>
                      setContent({
                        ...content,
                        membership: {
                          ...content.membership,
                          [locale]: {
                            ...content.membership[locale],
                            tiers: {
                              ...content.membership[locale].tiers,
                              [tierKey]: { ...tier, period: v },
                            },
                          },
                        },
                      })
                    }
                  />
                  <AdminField
                    label="CTA"
                    value={tier.cta}
                    onChange={(v) =>
                      setContent({
                        ...content,
                        membership: {
                          ...content.membership,
                          [locale]: {
                            ...content.membership[locale],
                            tiers: {
                              ...content.membership[locale].tiers,
                              [tierKey]: { ...tier, cta: v },
                            },
                          },
                        },
                      })
                    }
                  />
                  <AdminField
                    label="Beneficii (câte unul pe linie)"
                    value={tier.features.join("\n")}
                    onChange={(v) =>
                      setContent({
                        ...content,
                        membership: {
                          ...content.membership,
                          [locale]: {
                            ...content.membership[locale],
                            tiers: {
                              ...content.membership[locale].tiers,
                              [tierKey]: {
                                ...tier,
                                features: v.split("\n").filter(Boolean),
                              },
                            },
                          },
                        },
                      })
                    }
                    multiline
                    rows={5}
                  />
                </div>
              );
            })}
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("membership")}
            />
          </section>
        )}

        {tab === "shop" && (
          <section className="space-y-6">
            <LocaleTabs locale={locale} onChange={setLocale} />
            <AdminField
              label="Subiect email comandă"
              value={content.shop.orderSubject}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: { ...content.shop, orderSubject: v },
                })
              }
            />
            <AdminField
              label="Titlu pagină magazin"
              value={content.shop[locale].pageTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: {
                    ...content.shop,
                    [locale]: { ...content.shop[locale], pageTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Text pagină magazin"
              value={content.shop[locale].pageBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: {
                    ...content.shop,
                    [locale]: { ...content.shop[locale], pageBody: v },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Titlu pagină print"
              value={content.shop[locale].printPageTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: {
                    ...content.shop,
                    [locale]: { ...content.shop[locale], printPageTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Text pagină print"
              value={content.shop[locale].printPageBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: {
                    ...content.shop,
                    [locale]: { ...content.shop[locale], printPageBody: v },
                  },
                })
              }
              multiline
            />
            <AdminField
              label="Titlu secțiune print (magazin)"
              value={content.shop[locale].printSectionTitle}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: {
                    ...content.shop,
                    [locale]: { ...content.shop[locale], printSectionTitle: v },
                  },
                })
              }
            />
            <AdminField
              label="Text secțiune print"
              value={content.shop[locale].printSectionBody}
              onChange={(v) =>
                setContent({
                  ...content,
                  shop: {
                    ...content.shop,
                    [locale]: { ...content.shop[locale], printSectionBody: v },
                  },
                })
              }
              multiline
            />
            <div className="border-t border-ink-800 pt-6 space-y-4">
              <p className="text-sm text-ink-400">Produse</p>
              {content.shop.items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 bg-ink-900 border border-ink-800 rounded-lg space-y-3"
                >
                  <p className="text-sm text-signal/80">{item.id} · {item.category}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <AdminField
                      label="Nume RO"
                      value={item.ro.name}
                      onChange={(v) => {
                        const items = [...content.shop.items];
                        items[index] = { ...item, ro: { name: v } };
                        setContent({ ...content, shop: { ...content.shop, items } });
                      }}
                    />
                    <AdminField
                      label="Nume EN"
                      value={item.en.name}
                      onChange={(v) => {
                        const items = [...content.shop.items];
                        items[index] = { ...item, en: { name: v } };
                        setContent({ ...content, shop: { ...content.shop, items } });
                      }}
                    />
                  </div>
                  <AdminField
                    label="Preț (RON)"
                    value={String(item.price)}
                    onChange={(v) => {
                      const items = [...content.shop.items];
                      items[index] = { ...item, price: Number(v) || 0 };
                      setContent({ ...content, shop: { ...content.shop, items } });
                    }}
                  />
                </div>
              ))}
            </div>
            <SaveBar
              saving={saving}
              saved={saved}
              error={error}
              onSave={() => saveSection("shop")}
            />
          </section>
        )}
      </div>
    </div>
  );
}
