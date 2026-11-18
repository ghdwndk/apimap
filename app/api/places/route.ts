type NominatimPlace = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

const cacheHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2 || query.length > 120) {
    return Response.json(
      { error: "장소는 두 글자 이상, 120자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("addressdetails", "1");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "EodikkajiDistanceFinder/1.0",
        "Accept-Language": "ko,en",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return Response.json(
        { error: "장소 검색 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 502 },
      );
    }

    const places = (await response.json()) as NominatimPlace[];
    return Response.json(
      places.map((place) => ({
        id: place.place_id,
        name: place.display_name,
        lat: Number(place.lat),
        lon: Number(place.lon),
      })),
      { headers: cacheHeaders },
    );
  } catch {
    return Response.json(
      { error: "장소 검색 중 오류가 발생했습니다. 네트워크 연결을 확인해 주세요." },
      { status: 502 },
    );
  }
}
