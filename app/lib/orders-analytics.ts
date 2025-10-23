function apiUrl(path: string) {
  if (typeof window === "undefined") {
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      `http://localhost:${process.env.PORT || 3000}`;
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return path;
}

// Helper function to fetch orders analytics

export async function getOrdersAnalytics(days: number = 14) {
  try {
    const response = await fetch(apiUrl(`/api/analytics/orders?days=${days}`), {
      next: { revalidate: 180 } // Cache for 3 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders analytics')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching orders analytics:', error)
    throw new Error('Unable to load orders analytics')
  }
}
