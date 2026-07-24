import type { Tag } from "@/modules/tags/validation";

export type CreateTagRecordInput = {
  name: string;
  slug: string;
};

export interface TagRepository {
  create(input: CreateTagRecordInput): Promise<Tag>;
  findBySlug(slug: string): Promise<Tag | null>;
}
