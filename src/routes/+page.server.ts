//import { posts } from '$lib/server/posts';
// import { fetchAllPosts } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
  // const data = fetchAllPosts(1, undefined);
  return {};
};
