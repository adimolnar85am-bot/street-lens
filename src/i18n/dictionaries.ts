import type { Locale } from "./config";
import type ro from "./locales/ro";

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? DeepStringify<T[K]>
      : string;
};

export type Dictionary = DeepStringify<typeof ro>;

const dictionaries = {
  ro: () => import("./locales/ro").then((m) => m.default),
  en: () => import("./locales/en").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]() as Promise<Dictionary>;
}
