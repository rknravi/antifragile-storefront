import type { BlogPost } from "./content-types";
import { brandMarketing } from "./brand-images";

const BLOG_IMAGE_BY_SLUG: Record<string, string> = {
  "why-barrier-care-matters": brandMarketing.blog1,
  "morning-vs-night-routine": brandMarketing.blog2,
};

export function blogPostImage(post: Pick<BlogPost, "slug">): string {
  return BLOG_IMAGE_BY_SLUG[post.slug] ?? brandMarketing.blogFeatured;
}
