"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
};

type PlaceSearchProps = {
  label: string;
  marker: "A" | "B";
  selected: Place | null;
  onSelect: (place: Place | null) => void;
};

function PlaceSearch({ label, marker, selected, onSelect }: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 2) {
      setError("장소를 두 글자 이상 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query.trim())}`);
      const data = (await response.json()) as Place[] | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "검색에 실패했습니다.");
      }
      setResults(data);
      if (data.length === 0) setError("검색 결과가 없습니다. 다른 이름으로 검색해 보세요.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function choose(place: Place) {
    onSelect(place);
    setQuery("");
    setResults([]);
    setError("");
  }

  return (
    <section className="place-field">
      <div className={`place-marker marker-${marker.toLowerCase()}`}>{marker}</div>
      <div className="place-content">
        <p className="field-label">{label}</p>
        {selected ? (
          <div className="selected-place">
            <span>{selected.name}</span>
            <button
              className="change-place"
              onClick={() => onSelect(null)}
              type="button"
              aria-label={`${label} 다시 선택`}
            >
              변경
            </button>
          </div>
        ) : (
          <>
            <form className="search-form" onSubmit={search}>
              <input
                aria-label={label}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setError("");
                }}
                placeholder="장소 이름을 입력하세요"
                value={query}
              />
              <button disabled={loading} type="submit">
                {loading ? "검색 중" : "검색"}
              </button>
            </form>
            {error && <p className="field-message" role="status">{error}</p>}
            {results.length > 0 && (
              <ul className="results-list" aria-label={`${label} 검색 결과`}>
                {results.map((place) => (
                  <li key={place.id}>
                    <button onClick={() => choose(place)} type="button">
                      <span className="result-pin">⌖</span>
                      <span>{place.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters).toLocaleString("ko-KR")} m`;
  return `${(meters / 1000).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  })} km`;
}

function formatDuration(seconds: number) {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `약 ${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes === 0 ? `약 ${hours}시간` : `약 ${hours}시간 ${remainingMinutes}분`;
}

export default function Home() {
  const [origin, setOrigin] = useState<Place | null>(null);
  const [destination, setDestination] = useState<Place | null>(null);
  const [distance, setDistance] = useState<{ distance: number; duration: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculateRoute() {
    if (!origin || !destination) return;
    setLoading(true);
    setError("");
    setDistance(null);

    const params = new URLSearchParams({
      fromLat: String(origin.lat),
      fromLon: String(origin.lon),
      toLat: String(destination.lat),
      toLon: String(destination.lon),
    });

    try {
      const response = await fetch(`/api/distance?${params.toString()}`);
      const data = (await response.json()) as
        | { distance: number; duration: number }
        | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "경로를 찾지 못했습니다.");
      }
      setDistance(data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "경로 계산에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const mapUrl =
    origin && destination
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat}%2C${origin.lon}%3B${destination.lat}%2C${destination.lon}`
      : "";

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="어디까지 홈">
          <span className="brand-icon">↗</span>
          <span>어디까지</span>
        </Link>
        <span className="topbar-note">장소 사이, 얼마나 멀까?</span>
      </header>

      <div className="content">
        <section className="intro">
          <span className="eyebrow"><span /> ROUTE & DISTANCE</span>
          <h1>어디에서 어디까지,<br /><em>한눈에 확인해요.</em></h1>
          <p>장소를 검색하고 차량 이동 거리와 예상 시간을 확인해 보세요.</p>
        </section>

        <section className="route-card" aria-label="거리 계산">
          <div className="fields">
            <PlaceSearch
              label="출발지"
              marker="A"
              onSelect={(place) => {
                setOrigin(place);
                setDistance(null);
                setError("");
              }}
              selected={origin}
            />
            <div className="route-connector" aria-hidden="true">
              <span />
            </div>
            <PlaceSearch
              label="도착지"
              marker="B"
              onSelect={(place) => {
                setDestination(place);
                setDistance(null);
                setError("");
              }}
              selected={destination}
            />
          </div>

          <button
            className="calculate-button"
            disabled={!origin || !destination || loading}
            onClick={calculateRoute}
            type="button"
          >
            {loading ? "경로를 계산하고 있어요..." : "거리 확인하기"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>

          {error && <p className="route-error" role="alert">{error}</p>}

          {distance && (
            <div className="result-panel" aria-live="polite">
              <div className="result-heading">
                <span>차량 이동 거리</span>
                <span className="route-type">도로 경로 기준</span>
              </div>
              <p className="distance-value">{formatDistance(distance.distance)}</p>
              <p className="duration-value">예상 소요 시간 {formatDuration(distance.duration)}</p>
              <a className="map-link" href={mapUrl} rel="noreferrer" target="_blank">
                <span className="map-link-icon" aria-hidden="true">⌖</span>
                지도에서 보기
                <span className="external-arrow" aria-hidden="true">↗</span>
              </a>
            </div>
          )}
        </section>

        <p className="data-note">
          장소 정보와 경로는 OpenStreetMap, Nominatim, OSRM 데이터를 사용합니다.
          <br />
          경로는 차량 기준이며 실제 교통 상황과 다를 수 있습니다.
        </p>
      </div>

      <footer className="footer">
        <span>© 2026 어디까지</span>
        <span>지도 데이터 © OpenStreetMap contributors</span>
      </footer>
    </main>
  );
}
