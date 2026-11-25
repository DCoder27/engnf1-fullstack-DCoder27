# TriageSync Engineering Solution

## Part A - Architecture and data flow

```text
React/Vite frontend
        |
        | JSON requests + access token
        v
Express routes and middleware
        |
        v
Controllers -> Services -> Mongoose models
        |
        v
MongoDB Atlas
```

I used a feature-based structure on the frontend so authentication, tickets, resources, bookings, and admin features keep their own pages, components, API functions, and styles. On the backend, routes handle endpoint composition, controllers handle HTTP input and output, services contain business rules, and Mongoose models define persistence rules and indexes.

### Ticket import trace

1. The user selects a JSON feed from the ticket page.
2. The frontend sends the feed to `POST /api/tickets/import`.
3. Authentication and Zod validation run before the controller.
4. The import service finds each ticket by `externalId`.
5. New tickets are classified and inserted. Existing tickets are updated without replacing a human override.
6. The unique `externalId` index prevents duplicate tickets during repeated or concurrent imports.
7. The response returns import results, and the frontend refreshes the queue and statistics.

Ticket content is rendered as text by React, so HTML such as a script tag is displayed rather than executed. Ticket edits update the interface optimistically; if the request fails, the previous state is restored and an error is shown.

## Part B - Concurrency, idempotency, and human decisions

### Preventing overlapping bookings

Booking creation runs in a MongoDB transaction in `backend/src/services/bookingCreationService.js:32`. The requested time range is divided into 30-minute slots, and each slot has a unique `(resourceId, slotStart)` index.

The service claims these slots at `backend/src/services/bookingCreationService.js:88`. If two users request the same resource and time, only one transaction can insert the slot records. The other receives a conflict response. The booking and its slots are committed or rolled back together, and cancellation releases the slots.

### Safe ticket re-imports

`Ticket.externalId` is unique at `backend/src/models/Ticket.js:79`, making the feed import idempotent. Importing the same feed again updates the existing records instead of creating duplicates.

The check at `backend/src/services/ticketImportService.js:8` protects human decisions. Once an agent changes a classification, later automated imports may update the ticket text but do not overwrite its category or priority. Each manual change is also stored as a ticket event for audit history.

## Part C - Measured performance improvement

I measured the filtered ticket-list query using 800 temporary tickets, including 200 matching records. I ran 25 iterations before and after applying the production compound index:

```text
{ status: 1, category: 1, priority: 1, createdAt: -1 }
```

| Query plan | Average | p95 | Documents examined | Returned |
| --- | ---: | ---: | ---: | ---: |
| Collection scan | 172.21 ms | 333.76 ms | 815 | 100 |
| Compound index | 141.78 ms | 242.34 ms | 201 | 100 |

The index reduced average latency by 17.7%, p95 latency by 27.4%, and documents examined by 75.3%. The main benefit is that MongoDB can scan matching index entries instead of the full collection as the dataset grows.

The trade-off is additional index storage and slightly more work when indexed fields are written. It also does not improve case-insensitive subject/body regex searches, which would need a separate search strategy. I retained it because structured ticket filtering is a frequent read operation in this application.

## Part D - Improvement with one more day

I would improve session handling in `frontend/src/shared/api/httpClient.js:14`. Currently, an access token can expire while the user keeps the application open. I would add one coordinated refresh request, retry the failed API request once, and sign the user out if refresh fails.

I would also add frontend component and end-to-end tests for token expiry, optimistic rollback, booking conflicts, and role-based redirects.
