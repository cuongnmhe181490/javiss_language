import { env } from "@/config/env";
import { vi } from "@/i18n/dictionaries/vi";

export async function getDictionary(locale = env.DEFAULT_LOCALE) {
  if (locale === "vi") {
    return vi;
  }

  return vi;
}
