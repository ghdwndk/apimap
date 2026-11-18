const cacheHeaders = {
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
};

function parseCoordinate(value: string | null, min: number, max: number) {
  if (value === null || value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const fromLat = parseCoordinate(params.get("fromLat"), -90, 90);
  const fromLon = parseCoordinate(params.get("fromLon"), -180, 180);
  const toLat = parseCoordinate(params.get("toLat"), -90, 90);
  const toLon = parseCoordinate(params.get("toLon"), -180, 180);

  if (fromLat === null || fromLon === null || toLat === null || toLon === null) {
    return Response.json({ error: "출발지와 도착지를 다시 선택해 주세요." }, { status: 400 });
  }

  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${fromLon},${fromLat};${toLon},${toLat}`,
  );
  url.searchParams.set("overview", "false");
  url.searchParams.set("steps", "false");

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });

    if (!response.ok) {
      return Response.json(
        { error: "경로 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 502 },
      );
    }

    const result = (await response.json()) as {
      code?: string;
      routes?: Array<{ distance: number; duration: number }>;
    };
    const route = result.routes?.[0];

    if (result.code !== "Ok" || !route) {
      return Response.json(
        { error: "두 장소 사이의 차량 경로를 찾지 못했습니다." },
        { status: 404 },
      );
    }

    return Response.json(
      { distance: route.distance, duration: route.duration },
      { headers: cacheHeaders },
    );
  } catch {
    return Response.json(
      { error: "경로 계산 중 오류가 발생했습니다. 네트워크 연결을 확인해 주세요." },
      { status: 502 },
    );
  }
}
