# 어디까지

장소를 검색하고 두 지점 간 차량 도로 거리와 예상 소요 시간을 확인하는 Next.js 웹앱입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 장소 검색은 OpenStreetMap Nominatim, 차량 경로 계산은 OSRM 공개 서버를 사용합니다. API 키, Redis, 별도 환경변수는 필요하지 않습니다.

## Vercel 배포

저장소를 GitHub에 올린 뒤 Vercel에서 해당 저장소를 Import하면 됩니다. 기본 Next.js 설정으로 배포되며 환경변수 설정은 필요하지 않습니다.

Nominatim 및 OSRM 공개 서버는 무료 공개 서비스이며 사용량과 가용성이 제한될 수 있습니다. 본 앱은 검색어를 직접 제출할 때만 장소를 조회하고 검색 결과와 경로 결과를 캐시합니다. 대규모 트래픽이나 상업적 대량 사용에는 전용 서비스 구성이 필요합니다. 지도 및 장소 데이터에는 OpenStreetMap contributors 출처를 표시합니다.
