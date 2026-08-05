-- Supabase's own linter flags any extension living in `public`: everything in
-- that schema is reachable through the API, and an extension's functions have
-- no business being. The `citext` columns keep working — a column's type is
-- bound to the type itself, not to the schema it is named from.
alter extension citext set schema extensions;
