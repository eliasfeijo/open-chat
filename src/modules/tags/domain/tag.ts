export class TagResolutionFailedError extends Error {
  constructor(tagSlug: string) {
    super(`Tag ${tagSlug} could not be resolved.`);
    this.name = "TagResolutionFailedError";
  }
}

export function deduplicateTagSlugs(tagSlugs: string[]) {
  return Array.from(new Set(tagSlugs));
}
