/**
 * Sanitize a filename to be safe for cloud storage (Supabase, S3, etc.)
 * - Removes accents/diacritics (é -> e, œ -> oe)
 * - Converts to lowercase (optional, but recommended for consistency)
 * - Replaces non-alphanumeric characters (except dots) with hyphens
 * - Removes leading/trailing hyphens and dots
 * - Prevents double hyphens
 */
export const sanitizeFileName = (fileName: string): string => {
    // 1. Separate extension
    const lastDotIndex = fileName.lastIndexOf('.');
    let name = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : '';

    // 2. Normalize and remove accents
    // NFD decomposition splits characters like 'é' into 'e' + '´' (accent)
    // The regex [\u0300-\u036f] then matches and removes those combining marks
    name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 3. Handle special ligatures like œ, æ
    name = name.replace(/œ/g, 'oe').replace(/æ/g, 'ae').replace(/Œ/g, 'OE').replace(/Æ/g, 'AE');

    // 4. Replace any character that is NOT a letter, number, or hyphen with a hyphen
    // We keep it case-sensitive or insensitive based on preference (here preserved)
    name = name.replace(/[^a-zA-Z0-9-]/g, '-');

    // 5. Clean up hyphens (prevent doubles, remove start/end)
    name = name.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

    // 6. If name became empty after sanitization (special chars only), fallback to 'file'
    if (!name) name = 'file';

    // 7. Reassemble with lowercase extension
    return extension ? `${name}.${extension.toLowerCase()}` : name;
};
