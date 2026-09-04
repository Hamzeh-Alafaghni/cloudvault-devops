# 🧩 Monitoring & Observability — Hints (optional stretch goal)

> This whole area is a **stretch goal**. The core project is done without it, but
> a production-minded engineer can *see* what their system is doing. Nothing here
> is implemented for you.

## The goal
Give CloudVault the three pillars of observability and be able to answer "is it
healthy, and if not, where does it hurt?" without SSH-ing into a box.

## Requirements / hints (questions, not answers)
- **Metrics:** stand up **Prometheus** + **Grafana** (locally, $0). What would you
  scrape? Each service could expose a `/metrics` endpoint — what format does
  Prometheus expect? Which RED/USE metrics matter for an API gateway vs. a queue
  consumer (`thumbnail-worker`)?
- **Dashboards:** build one Grafana dashboard that shows request rate, error rate,
  and latency for the gateway, plus event-processing lag for the worker. What does
  "healthy" look like, and what threshold means "page someone"?
- **Alerts:** what are your SLOs? Which alerts are actionable vs. noise?
- **Logs:** the services log to stdout (12-factor). How would you aggregate them
  (e.g. Loki)? What correlation id would let you trace one upload across services?
- **Tracing (further stretch):** OpenTelemetry across gateway → services → worker.

## Definition of done (if you attempt it)
- Prometheus scrapes every service; Grafana shows a working dashboard.
- At least one meaningful alert fires in a failure you deliberately inject
  (e.g. stop `files-service` and watch readiness + error-rate react).

## Fair-game references
- Prometheus: <https://prometheus.io/docs/> · Grafana: <https://grafana.com/docs/>
- The four golden signals: <https://sre.google/sre-book/monitoring-distributed-systems/>
- OpenTelemetry: <https://opentelemetry.io/docs/>
