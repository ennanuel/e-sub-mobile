/** Every URL in the app, in one place. */
export const routes = {
  home: (slug: string, queryParams?: Record<string, string>) => {
    const searchParams = new URLSearchParams(queryParams);
    const searchParamsStr = queryParams ? `?${searchParams?.toString()}` : '';
    return  `/developments/${slug}${searchParamsStr}`
  },
  listing: (slug: string) => `/developments/${slug}?view=listing`,
  faq: (slug: string) => `/developments/${slug}/faq`,
  papers: (slug: string) => `/developments/${slug}/papers`,
  paper: (slug: string, paperId: string) => `/developments/${slug}/papers?doc=${paperId}`,
  plot: (slug: string, plotId: string, months?: number) => `/developments/${slug}/plots/${plotId}${months ? `?plan=${months}` : ''}`,
  buy: {
    terms: (slug: string) => `/developments/${slug}/buy/terms`,
    email: (slug: string) => `/developments/${slug}/buy/email`,
    verify: (slug: string) => `/developments/${slug}/buy/verify`,
    details: (slug: string) => `/developments/${slug}/buy/details`,
    offer: (slug: string, equityId: string) => `/developments/${slug}/buy/offer/${equityId}`,
    pay: (slug: string, equityId: string) => `/developments/${slug}/buy/pay/${equityId}`,
    thankYou: (slug: string, equityId: string) => `/developments/${slug}/buy/thank-you/${equityId}`,
  },
};
