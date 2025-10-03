export const config = {
    runtime: "edge",
  };
  
  export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url);
      const photoRef = searchParams.get("id");
      const maxWidthPx = searchParams.get("w") || 400;
      const maxHeightPx = searchParams.get("h") || 400;
  
      if (!photoRef) {
        return new Response(JSON.stringify({ error: "Missing photoRef" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // Monta a URL da Places API (sem expor a chave ao cliente)
      const url = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=${maxHeightPx}&maxWidthPx=${maxWidthPx}&key=${process.env.GOOGLE_PLACES_KEY}`;
  
      const response = await fetch(url);
  
      if (!response.ok) {
        console.error("Google Places photo fetch error:", await response.text());
        return new Response(JSON.stringify({ error: "Failed to fetch photo" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
  
      // Repassa a imagem diretamente
      return new Response(await response.arrayBuffer(), {
        status: 200,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400", // cache de 1 dia
        },
      });
    } catch (err) {
      console.error("Proxy error:", err);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  