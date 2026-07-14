import Chargebee from 'chargebee';

export async function POST(request: Request) {
  const site = process.env.NEXT_PUBLIC_CHARGEBEE_SITE;
  const apiKey = process.env.CHARGEBEE_API_KEY;
  const planId = process.env.CHARGEBEE_PLAN_ID;

  if (!site || !apiKey || !planId) {
    return Response.json(
      { error: 'Chargebee is not fully configured on this server.' },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const clickID: string | null = body.clickID ?? null;

  const chargebee = new Chargebee({ site, apiKey });

  try {
    // https://apidocs.chargebee.com/docs/api/hosted_pages#checkout_new_for_items
    // cf_* custom fields are valid Chargebee params but absent from the SDK types
    const params = {
      subscription_items: [{ item_price_id: planId, quantity: 1 }],
      ...(clickID ? { cf_click_id: clickID } : {}),
    } as Parameters<typeof chargebee.hostedPage.checkoutNewForItems>[0];
    const { hosted_page } = await chargebee.hostedPage.checkoutNewForItems(params);

    return Response.json(hosted_page);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chargebee error';
    return Response.json({ error: message }, { status: 500 });
  }
}
