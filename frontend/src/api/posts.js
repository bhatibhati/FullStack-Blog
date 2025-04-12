const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const fetchPosts = async()=>{
    const res = await fetch(`${BASE_URL}/posts`)
    if(!res.ok) throw new error('Failed to fetch posts')
        return await res.json()
}