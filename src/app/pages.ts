// Page routes in navigation order; their labels and copy live in the i18n dictionaries (t.pages)
export const PAGE_PATHS = ["/", "/peaks", "/calendar", "/access"] as const;
export type PagePath = (typeof PAGE_PATHS)[number];
