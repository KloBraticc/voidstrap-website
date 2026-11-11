const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "public, max-age=900" } });

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

export async function onRequest() {
  try {
    const sorts = await getJson(`https://apis.roblox.com/explore-api/v1/get-sorts?sessionId=${crypto.randomUUID()}`);
    const top = (sorts.sorts || []).find((s) => (s.sortId || "").includes("top-playing"));
    const games = (top?.games || []).filter((g) => !/brookhaven/i.test(g.name)).slice(0, 8);
    for (const game of games) {
      const media = await getJson(`https://games.roblox.com/v2/games/${game.universeId}/media`);
      const clip = (media.data || []).find((m) => m.assetType === "GamePreviewVideo" && m.videoId && m.approved);
      if (!clip) continue;
      const thumbs = await getJson(`https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=${game.universeId}&size=768x432&format=Webp&countPerUniverse=1`);
      const votes = game.totalUpVotes + game.totalDownVotes;
      return json({
        name: game.name,
        players: game.playerCount,
        likes: votes ? Math.round((game.totalUpVotes / votes) * 100) : null,
        url: `https://www.roblox.com/games/${game.rootPlaceId}`,
        launch: `roblox://experiences/start?placeId=${game.rootPlaceId}`,
        thumbnail: thumbs.data?.[0]?.thumbnails?.[0]?.imageUrl || null,
        video: `/api/video?id=${clip.videoId}`
      });
    }
    return json({ error: "no trailer" }, 404);
  } catch {
    return json({ error: "unavailable" }, 502);
  }
}
