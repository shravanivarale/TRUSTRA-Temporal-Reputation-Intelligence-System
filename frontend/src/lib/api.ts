const API_URL = "http://localhost:5000/api";

export async function fetchTrustData(sellerId: string) {
    try {
        const res = await fetch(`${API_URL}/trust/${sellerId}`);
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        return await res.json();
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}
