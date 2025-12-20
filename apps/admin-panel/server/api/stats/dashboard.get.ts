export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.directusUrl;
  const token = config.directusApiToken;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    // Fetch all aggregations in parallel
    const [
      totalPersonsRes,
      activePersonsRes,
      activeAccountsRes,
      blockedAccountsRes,
      balanceRes,
    ] = await Promise.all([
      // Total persons
      $fetch(`${baseUrl}/items/Persons?aggregate[count]=*`, { headers }),
      // Active persons
      $fetch(`${baseUrl}/items/Persons?aggregate[count]=*&filter[status][_eq]=active`, { headers }),
      // Active accounts
      $fetch(`${baseUrl}/items/accounts?aggregate[count]=*&filter[status][_eq]=active`, { headers }),
      // Blocked accounts
      $fetch(`${baseUrl}/items/accounts?aggregate[count]=*&filter[status][_eq]=blocked`, { headers }),
      // Sum of positive balances
      $fetch(`${baseUrl}/items/accounts?aggregate[sum]=balance&filter[balance][_gt]=0`, { headers }),
    ]);

    const totalPersons = (totalPersonsRes as any)?.data?.[0]?.count || 0;
    const activePersons = (activePersonsRes as any)?.data?.[0]?.count || 0;
    const activeAccounts = (activeAccountsRes as any)?.data?.[0]?.count || 0;
    const blockedAccounts = (blockedAccountsRes as any)?.data?.[0]?.count || 0;
    const totalPositiveBalance = (balanceRes as any)?.data?.[0]?.sum?.balance || 0;

    return {
      data: {
        totalPersons: Number(totalPersons),
        activePersons: Number(activePersons),
        activeAccounts: Number(activeAccounts),
        blockedAccounts: Number(blockedAccounts),
        totalPositiveBalance: Number(totalPositiveBalance),
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dashboard stats',
    });
  }
});
