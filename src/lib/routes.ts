/** Every URL in the app, in one place. */
export const routes = {
  home: (slug: string, queryParams?: Record<string, string>) => {
    const searchParams = new URLSearchParams(queryParams);
    const searchParamsStr = queryParams ? `?${searchParams?.toString()}` : '';
    return routesWrapper(`/developments/${slug}${searchParamsStr}`);
  },
  listing: (slug: string) => routesWrapper(`/developments/${slug}?view=listing`),
  faq: (slug: string) => routesWrapper(`/developments/${slug}/faq`),
  papers: (slug: string) => routesWrapper(`/developments/${slug}/papers`),
  paper: (slug: string, paperId: string) => routesWrapper(`/developments/${slug}/papers?doc=${paperId}`),
  plot: (slug: string, plotId: string, months?: number) =>
    routesWrapper(`/developments/${slug}/plots/${plotId}${months ? `?plan=${months}` : ''}`),
  buy: {
    terms: (slug: string) => routesWrapper(`/developments/${slug}/buy/terms`),
    email: (slug: string) => routesWrapper(`/developments/${slug}/buy/email`),
    verify: (slug: string) => routesWrapper(`/developments/${slug}/buy/verify`),
    details: (slug: string) => routesWrapper(`/developments/${slug}/buy/details`),
    offer: (slug: string, equityId: string) => routesWrapper(`/developments/${slug}/buy/offer/${equityId}`),
    pay: (slug: string, equityId: string) => routesWrapper(`/developments/${slug}/buy/pay/${equityId}`),
    thankYou: (slug: string, equityId: string) => routesWrapper(`/developments/${slug}/buy/thank-you/${equityId}`),
  },
};

const routesWrapper = (path: string) => {
  const [pathname, searchParams] = path?.split('?');
  const agentIdAlreadyExists = searchParams?.includes('agent_referral_id');
  let agentId = '';

  if (!agentIdAlreadyExists) {
    try {
      const urlSearchParams = new URLSearchParams(window.location.search);
      agentId = urlSearchParams.get('agent_referral_id');
    } catch {
      agentId = '';
    }
  }

  return `${pathname}${agentId || searchParams ? '?' : ''}${searchParams || ''}${agentId ? `${searchParams ? '&' : ''}agent_referral_id=${agentId}` : ''}`;
};
