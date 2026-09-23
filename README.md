# Task 1 (Variant): Campus Lost & Found API

You are building the backend for a campus **Lost & Found** board. Students
report items they've lost or found; anyone can browse and manage them —
there's no login for this variant.

Express + MongoDB (Mongoose), one entity that needs full CRUD and request
validation.


## What's already done for you

- `server/src/index.js`, `server/src/app.js`, `server/src/config/db.js` — app
  bootstrap and DB connection.
- `server/src/models/User.js` — a plain user schema (`name`, `email`,
  `password`). It's not tied to any login flow here; it exists so
  `Item.reportedBy` has something to reference.
- `server/src/controllers/userController.js` + `server/src/routes/users.js`
  — full CRUD over users, already wired, as a worked example of what your
  `itemController.js` should look like structurally (validation → DB call →
  response, one function per route).

Run `npm install` then `npm run dev` inside `server/` once you've filled in
the TODOs below. There is no `.env` provided — create your own
`server/.env` (it's git-ignored) with the keys below.

## Database connection

Create `server/.env` yourself with:

```
PORT=4000
MONGO_URI=mongodb://tasks:pass1234@ac-j3acrgb-shard-00-00.lueesfz.mongodb.net:27017,ac-j3acrgb-shard-00-01.lueesfz.mongodb.net:27017,ac-j3acrgb-shard-00-02.lueesfz.mongodb.net:27017/?ssl=true&replicaSet=atlas-6to6iy-shard-0&authSource=admin&appName=Cluster0
```

## What you need to build

### 1. The `Item` model — `server/src/models/Item.js`

Fields:
| field | type | rules |
|---|---|---|
| `title` | String | required |
| `description` | String | optional |
| `category` | String | enum: `electronics`, `clothing`, `documents`, `accessories`, `other`; default `other` |
| `status` | String | enum: `lost`, `found`, `claimed`; default `lost` |
| `location` | String | optional (where it was lost/found, e.g. "Library, 2nd floor") |
| `reportedBy` | ObjectId ref `User` | optional, plain field like any other — the client sends it if it wants to attribute the report to a user |

Add a `{ timestamps: true }` schema option, and a **compound index** so the
same title can't be reported twice at the same location (think about what
"unique" should mean here — is it `{ title, location }`? ).

### 2. Validation — inside `server/src/controllers/itemController.js`

Write a Joi (or express-validator, your choice) schema for create/update.
Compare it to the schemas already in `userController.js`.

### 3. Controller + routes

Implement full CRUD over items — create, read one, read all, update, and
delete. Decide the paths and HTTP methods yourself, following standard
REST conventions, and wire them up in `routes/items.js`.

### 4. Stretch goal — filtering

Add `GET /api/items?status=lost&category=electronics` style query filtering
on top of the base list endpoint.

### 5. Stretch goal — populate

Use Mongoose's `.populate('reportedBy')` on `getAllItems`/`getItem` so the
response includes the referenced user's `name`/`email` instead of just an
id. Look up what `.populate()` actually does under the hood (it's a second
query, not a SQL join) before you use it.

You're expected to use AI tools while building this — that's fine and
expected. But you should be able to explain, for any line in your
controller, *why* it's there and what happens if you delete it. We will ask.
