# Syncly — Deep Technical Interview Question Bank

These questions are tailored to your current codebase and intentionally probe for implementation-level understanding, system tradeoffs, and failure handling.

## 1) Auth & Session Integrity

1. **Question:** In `auth.middleware.js`, you only read JWT from `req.cookies.token`. Walk me through exactly how authentication breaks if the frontend later migrates to mobile clients or third-party integrations, and what migration path you'd design without weakening security.
   - **What this tests:** Cookie-based auth assumptions, API client diversity, backward-compatible auth strategy.
   - **Follow-up if weak:** “Give me a transition plan that supports both cookie auth and bearer tokens, including revocation behavior and CSRF impact.”

2. **Question:** Your Axios interceptor redirects any 401 to `/signin`. Describe a scenario where that creates a destructive UX loop or data loss, and how you would redesign error handling so auth failures are recoverable instead of abrupt.
   - **What this tests:** Client-side failure handling, UX under auth expiry, resilient session refresh patterns.
   - **Follow-up if weak:** “How would you differentiate `expired token`, `disabled account`, and `network partition` in the UI state machine?”

3. **Question (trick):** In the auth middleware, you select `status` and reject disabled users. Why is this check still insufficient for immediate account lockout in a JWT system, and what architecture do you need for truly immediate invalidation?
   - **What this tests:** Stateless JWT limitations, token invalidation, session store/blacklist design.
   - **Follow-up if weak:** “Estimate read/write overhead of your invalidation design at 100k MAU.”

## 2) Authorization & Multi-Tenant Data Isolation

4. **Question:** `loadProject` + `requireProjectMember` protects many project routes. Identify one route-level mistake that could bypass intended constraints in future refactors, and how you’d encode guardrails to make that mistake hard to ship.
   - **What this tests:** Defense-in-depth, secure-by-default routing conventions, maintainability.
   - **Follow-up if weak:** “Would you enforce this with middleware composition helpers, tests, or static analysis? Show one concrete pattern.”

5. **Question:** `addMemberToProject` rechecks admin role even though route middleware already requires admin. Why might this duplication be both good and bad? Where would you draw the line between redundancy and drift risk?
   - **What this tests:** Security redundancy tradeoffs, coupling between controller and routing assumptions.
   - **Follow-up if weak:** “If route middleware changes accidentally, what test would fail first in your current suite?”

6. **Question (edge case):** In member removal and role changes, you prevent removing/demoting the last admin by counting admins, then updating. Explain the race condition here under concurrent requests and how to make this atomic.
   - **What this tests:** Concurrency, transactional consistency, MongoDB atomicity patterns.
   - **Follow-up if weak:** “Show how you’d implement this with MongoDB transactions or conditional updates.”

## 3) Data Modeling, Query Shape & Performance

7. **Question:** Chat unread counts are computed per chat with `Message.countDocuments(...)` in `formatChatForUser`. Explain how this behaves with 500 chats and why it becomes an N+1 query problem. Give two scalable alternatives.
   - **What this tests:** Query complexity, aggregation, denormalization tradeoffs.
   - **Follow-up if weak:** “Which index supports your chosen design, and what write amplification does it introduce?”

8. **Question:** You store `participantKey` as sorted IDs for uniqueness. Convince me this is the right invariant and then tell me when it fails if group chat is introduced.
   - **What this tests:** Data invariants, schema evolution constraints.
   - **Follow-up if weak:** “What migration strategy avoids downtime while moving to N-participant chats?”

9. **Question (trick):** `getProjectMembers` checks `if (!members)` after `find()`. Why is that logically incorrect, and what kind of production bug can slip through because of this misunderstanding?
   - **What this tests:** ORM return semantics, null vs empty-array correctness.
   - **Follow-up if weak:** “Where else in your codebase might this same bug pattern exist?”

10. **Question:** In `updateProjectTask`, `dueDate` accepts any parseable date string. Explain the hidden correctness issues around timezone normalization and invalid date coercion, and how you’d harden validation.
   - **What this tests:** Data validation rigor, date-time correctness in distributed systems.
   - **Follow-up if weak:** “How would you store/display due dates for globally distributed teams without off-by-one-day bugs?”

## 4) Realtime Messaging Reliability

11. **Question:** Your frontend uses both socket-driven updates and polling (10s for chats, 5s for messages). Defend this hybrid model with concrete failure modes it addresses, then quantify the server load impact.
   - **What this tests:** Realtime reliability, cost-awareness, fallback design.
   - **Follow-up if weak:** “At 10k concurrent users, estimate request volume from polling alone.”

12. **Question:** `sendChatMessage` persists message then emits `chat:update`. Describe what happens if DB write succeeds but socket emit fails, and vice versa. How do you guarantee eventual consistency for both participants?
   - **What this tests:** Distributed consistency, delivery guarantees, idempotent reconciliation.
   - **Follow-up if weak:** “Would you introduce an outbox pattern here? Why or why not?”

13. **Question (edge case):** In the UI, `isSender` compares `message.senderId === userId`. What subtle bug appears depending on whether IDs are serialized as ObjectId objects vs strings, and how do you make this comparison robust?
   - **What this tests:** Serialization boundaries, frontend identity matching correctness.
   - **Follow-up if weak:** “Show a unit test that catches this mismatch.”

14. **Question:** In `app.js`, you have one socket convention (`joinUser`, `chat:update`) while `socket/socket.js` defines a different event naming style (`join_project`, `receive_message`). Explain the architectural risk and how you’d enforce event contract consistency.
   - **What this tests:** API contract governance, dead code detection, realtime protocol versioning.
   - **Follow-up if weak:** “How would you share socket event types between frontend and backend to prevent drift?”

## 5) API Contracts, Errors & Observability

15. **Question:** Error responses vary between `{ success: false, message }` and `{ error: ... }`. Why is that more than cosmetic, and what downstream systems break first (frontend, analytics, alerting, SDKs)?
   - **What this tests:** Contract consistency, operability, cross-team integration maturity.
   - **Follow-up if weak:** “Design a normalized error envelope with machine-readable codes.”

16. **Question:** The request timer middleware logs request durations, but where are your SLOs defined? Give one measurable SLO for chat send latency and explain exactly what metrics and tags you’d emit.
   - **What this tests:** Production observability, performance engineering, SRE fundamentals.
   - **Follow-up if weak:** “How do you avoid cardinality explosions in metric labels?”

17. **Question (trick):** `/health` reports DB state using mongoose connection state labels. Explain why this can return “healthy” while user-facing operations still fail.
   - **What this tests:** Health check semantics, liveness vs readiness, dependency granularity.
   - **Follow-up if weak:** “What would you include in readiness checks without creating cascading failure risk?”

## 6) Product Behavior Under Stress & Abuse

18. **Question:** Chat request creation can trigger notifications each time status flips from rejected to pending. How would you prevent notification spam while preserving legitimate retry behavior?
   - **What this tests:** Abuse prevention, product constraints, idempotency/windowing.
   - **Follow-up if weak:** “Would you enforce this in DB schema, service logic, or queue consumer?”

19. **Question:** What is your strategy when one teammate is disabled/deleted while existing chats and tasks reference them? Walk through API responses and UI behavior you want users to see.
   - **What this tests:** Referential integrity lifecycle, soft-delete design, graceful degradation.
   - **Follow-up if weak:** “Show me exactly which queries must change to preserve historical data without exposing disabled users as active contacts.”

20. **Question (what-if):** Assume enterprise customers now require audit-grade immutability for project activity and message history. What changes do you make to schema, write path, and admin tooling to satisfy this without killing performance?
   - **What this tests:** Compliance-driven architecture, append-only modeling, retention policy design.
   - **Follow-up if weak:** “How do you support GDPR delete requests under an immutable audit policy?”

## 7) Architecture Evolution Questions

21. **Question:** If you had to shard this system by organization tomorrow, what current design choice becomes the largest migration blocker?
   - **What this tests:** Tenant-boundary modeling, future scalability planning.
   - **Follow-up if weak:** “Show me which collections need `orgId`, and how you'd backfill safely.”

22. **Question:** Right now, invite acceptance, membership updates, notifications, and activity logs are spread across controllers. Would you keep this controller-centric orchestration or introduce domain services/events? Defend your choice with failure recovery implications.
   - **What this tests:** Modular architecture, transaction boundaries, orchestration strategy.
   - **Follow-up if weak:** “Pick one workflow and show the exact boundaries you’d refactor first.”

23. **Question (what-if):** Product asks for offline-first messaging with eventual sync. What assumptions in your current client and server logic break immediately?
   - **What this tests:** Offline conflict resolution, message ordering, idempotency keys.
   - **Follow-up if weak:** “How would you dedupe retried sends without dropping legitimate duplicate messages?”

24. **Question:** You currently mix synchronous side effects (notifications/activity writes) into request handlers. How do you decide what must be inline vs queued, and what user-facing consistency tradeoff are you willing to accept?
   - **What this tests:** Critical path optimization, async architecture tradeoffs.
   - **Follow-up if weak:** “Name one side effect you would move to a queue first and define retry semantics.”

---

## How to use this question set

- Start with one section at a time and answer aloud as if in a live interview.
- For each answer, force yourself to discuss *current behavior*, *failure case*, and *improvement plan*.
- If you can’t point to exact code and data flow, treat that as a gap to fix before interviews.
