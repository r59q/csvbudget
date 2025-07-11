// Centralized category color logic for consistent coloring across components

export const CATEGORY_COLORS = [
    '#7dd3fc', '#f9a8d4', '#a7f3d0', '#fcd34d', '#c4b5fd', '#fdba74', '#fca5a5', '#6ee7b7', '#fef08a', '#a5b4fc',
    '#fbbf24', '#f472b6', '#34d399', '#818cf8', '#f87171', '#38bdf8', '#facc15', '#a3e635', '#fb7185', '#fca5a5',
];

/**
 * Returns a color for a given category name, based on its index in the master sorted list.
 * @param category The category name
 * @param allCategories The master sorted list of all categories
 */
export function getCategoryColorForName(category: string, allCategories: string[]): string {
    const idx = allCategories.indexOf(category);
    if (idx === -1) return CATEGORY_COLORS[0];
    return CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
}

