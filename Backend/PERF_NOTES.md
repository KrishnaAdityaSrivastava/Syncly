## Baseline Performance
A request-timing middleware using high-resolution timers was added to measure end-to-end request latency. This helped identify endpoints exceeding 500 ms under baseline load.

## Hot Endpoints

### POST /auth/sign-in
- Request count: 2  
- Slow requests (>500 ms): 1  
- Average latency: ~497 ms  
- Maximum latency: ~683 ms  
- Notes: Occasional high latency observed.

### GET /users/data
- Request count: 22  
- Slow requests (>500 ms): 0  
- Average latency: ~78 ms  
- Maximum latency: ~332 ms  
- Notes: Higher load endpoint but stable and consistently performant.

### GET /projects/
- Request count: 38  
- Slow requests (>500 ms): 0  
- Average latency: ~183 ms  
- Maximum latency: ~454 ms  
- Notes: Higher load endpoint but within acceptable latency limits.

## Bottlenecks Observed
The authentication endpoint (`POST /auth/sign-in`) exhibited intermittent latency spikes. Other frequently accessed endpoints remained within expected performance thresholds.

## Improvements Applied
Baseline performance metrics were established to identify slow endpoints and guide future optimization efforts.
