import Chargebee from 'chargebee';

export async function POST() {
  const site = process.env.NEXT_PUBLIC_CHARGEBEE_SITE;
  const apiKey = process.env.CHARGEBEE_API_KEY;
  const planId = process.env.CHARGEBEE_PLAN_ID;

  if (!site || !apiKey || !planId) {
    return Response.json(
      { error: 'Chargebee is not fully configured on this server.' },
      { status: 500 }
    );
  }

  const chargebee = new Chargebee({ site, apiKey });

  try {
    // https://apidocs.chargebee.com/docs/api/hosted_pages#checkout_new_for_items
    const { hosted_page } = await chargebee.hostedPage.checkoutNewForItems({
      subscription_items: [{ item_price_id: planId, quantity: 1 }],
    });

    return Response.json(hosted_page);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Chargebee error';
    return Response.json({ error: message }, { status: 500 });
  }
}
