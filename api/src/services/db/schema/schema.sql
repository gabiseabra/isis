
-- Dumped from database version 17.10
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET search_path = public;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ltree; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS ltree WITH SCHEMA public;


--
-- Name: EXTENSION ltree; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION ltree IS 'data type for hierarchical tree-like structures';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: book_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.book_status AS ENUM (
    'published',
    'unpublished'
);


--
-- Name: jsonb_query_match(jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jsonb_query_match(input jsonb, expression text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $_$
DECLARE
  expr TEXT := btrim(expression);
  len INT;
  i INT;
  ch TEXT;
  depth INT;
  brace INT;
  bracket INT;
  str BOOLEAN;
  esc BOOLEAN;
  op TEXT;
  m TEXT[];
  v JSONB;
  r JSONB;
  a TEXT;
  b TEXT;
BEGIN
  LOOP
    len := length(expr);
    EXIT WHEN len < 2 OR left(expr, 1) <> '(' OR right(expr, 1) <> ')';
    depth := 0; brace := 0; bracket := 0; str := false; esc := false;
    FOR i IN 1..len LOOP
      ch := substr(expr, i, 1);
      IF str THEN
        IF esc THEN esc := false; ELSIF ch = '\' THEN esc := true; ELSIF ch = '"' THEN str := false; END IF;
      ELSE
        IF ch = '"' THEN str := true;
        ELSIF ch = '{' THEN brace := brace + 1; ELSIF ch = '}' THEN brace := brace - 1;
        ELSIF ch = '[' THEN bracket := bracket + 1; ELSIF ch = ']' THEN bracket := bracket - 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = '(' THEN depth := depth + 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = ')' THEN depth := depth - 1; IF depth = 0 AND i < len THEN EXIT; END IF;
        END IF;
      END IF;
    END LOOP;
    EXIT WHEN depth <> 0 OR i < len;
    expr := btrim(substr(expr, 2, len - 2));
  END LOOP;

  FOREACH op IN ARRAY ARRAY[' or ', ' and '] LOOP
    depth := 0; brace := 0; bracket := 0; str := false; esc := false;
    FOR i IN 1..greatest(length(expr) - length(op) + 1, 0) LOOP
      ch := substr(expr, i, 1);
      IF str THEN
        IF esc THEN esc := false; ELSIF ch = '\' THEN esc := true; ELSIF ch = '"' THEN str := false; END IF;
      ELSE
        IF depth = 0 AND brace = 0 AND bracket = 0 AND substr(expr, i, length(op)) = op THEN
          IF op = ' or ' THEN
            RETURN jsonb_query_match(input, substr(expr, 1, i - 1)) OR jsonb_query_match(input, substr(expr, i + length(op)));
          END IF;
          RETURN jsonb_query_match(input, substr(expr, 1, i - 1)) AND jsonb_query_match(input, substr(expr, i + length(op)));
        END IF;
        IF ch = '"' THEN str := true;
        ELSIF ch = '{' THEN brace := brace + 1; ELSIF ch = '}' THEN brace := brace - 1;
        ELSIF ch = '[' THEN bracket := bracket + 1; ELSIF ch = ']' THEN bracket := bracket - 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = '(' THEN depth := depth + 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = ')' THEN depth := depth - 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  m := regexp_match(expr, '^([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)[[:space:]]*(!=|\^=|\$=|%=|>=|<=|#=|=|>|<)[[:space:]]*(.+)$');
  IF m IS NULL THEN RAISE EXCEPTION 'Invalid jsonb query expression: %', expression; END IF;
  v := input #> string_to_array(m[1], '.');
  op := m[2];
  r := m[3]::jsonb;

  IF op = '=' THEN RETURN coalesce(v = r, false); END IF;
  IF op = '!=' THEN RETURN coalesce(v <> r, false); END IF;
  IF op = '^=' THEN RETURN coalesce(jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND (v #>> '{}') LIKE replace(replace(replace(r #>> '{}', '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\', false); END IF;
  IF op = '$=' THEN RETURN coalesce(jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND (v #>> '{}') LIKE '%' || replace(replace(replace(r #>> '{}', '\', '\\'), '%', '\%'), '_', '\_') ESCAPE '\', false); END IF;
  IF op = '%=' THEN RETURN coalesce(jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND (v #>> '{}') LIKE '%' || replace(replace(replace(r #>> '{}', '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\', false); END IF;

  IF jsonb_typeof(v) = 'number' AND jsonb_typeof(r) = 'number' THEN
    IF op = '>' THEN RETURN (v #>> '{}')::numeric > (r #>> '{}')::numeric; END IF;
    IF op = '<' THEN RETURN (v #>> '{}')::numeric < (r #>> '{}')::numeric; END IF;
    IF op = '>=' THEN RETURN (v #>> '{}')::numeric >= (r #>> '{}')::numeric; END IF;
    IF op = '<=' THEN RETURN (v #>> '{}')::numeric <= (r #>> '{}')::numeric; END IF;
    IF op = '#=' THEN RETURN (v #>> '{}')::numeric = (r #>> '{}')::numeric; END IF;
  END IF;

  a := v #>> '{}'; b := r #>> '{}';
  IF jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND a ~ '^\d{4}-\d{2}-\d{2}T' AND b ~ '^\d{4}-\d{2}-\d{2}T' THEN
    IF op = '>' THEN RETURN a::timestamptz > b::timestamptz; END IF;
    IF op = '<' THEN RETURN a::timestamptz < b::timestamptz; END IF;
    IF op = '>=' THEN RETURN a::timestamptz >= b::timestamptz; END IF;
    IF op = '<=' THEN RETURN a::timestamptz <= b::timestamptz; END IF;
    IF op = '#=' THEN RETURN a::timestamptz = b::timestamptz; END IF;
  END IF;

  RETURN false;
END;
$_$;


--
-- Name: ltree_from_string(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ltree_from_string(path text) RETURNS public.ltree
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $$
  SELECT nullif(replace(path, '/', '.'), '')::LTREE;
$$;


--
-- Name: ltree_to_string(public.ltree); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ltree_to_string(path public.ltree) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
    AS $$
  SELECT replace(path::TEXT, '.', '/');
$$;


--
-- Name: set_media_entry_path(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_media_entry_path() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  parent_path LTREE;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = NEW.slug::LTREE;
  ELSE
    SELECT "path" INTO parent_path
    FROM media_entries
    WHERE id = NEW.parent_id;

    NEW.path = parent_path || NEW.slug::LTREE;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.path <> OLD.path THEN
    UPDATE media_entries
    SET "path" = NEW.path || subpath("path", nlevel(OLD.path))
    WHERE "path" <@ OLD.path
      AND id <> OLD.id;
  END IF;

  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authors (
    id bigint NOT NULL,
    name text NOT NULL,
    image_url text,
    country_code character(2),
    birth_year smallint,
    death_year smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: authors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.authors ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.authors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: book_authors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_authors (
    book_id bigint NOT NULL,
    author_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: book_genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_genres (
    book_id bigint NOT NULL,
    genre_id bigint NOT NULL,
    featured_index integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: book_languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_languages (
    book_id bigint NOT NULL,
    language_code character(2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id bigint NOT NULL,
    title text NOT NULL,
    status public.book_status DEFAULT 'unpublished'::public.book_status NOT NULL,
    slug character varying(255),
    tags text[] DEFAULT ARRAY[]::text[] NOT NULL,
    isbn13 character(13),
    isbn10 character(10),
    image_url text,
    publish_year smallint,
    publisher_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.books ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.books_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.countries (
    code character(2) NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: draft_books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.draft_books (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    book_id bigint,
    title text NOT NULL,
    slug character varying(255),
    tags text[] DEFAULT ARRAY[]::text[] NOT NULL,
    isbn13 character(13),
    isbn10 character(10),
    image_url text,
    publish_year smallint,
    publisher jsonb NOT NULL,
    authors jsonb NOT NULL,
    languages text[] DEFAULT ARRAY[]::text[] NOT NULL,
    applied_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.genres (
    id bigint NOT NULL,
    name text NOT NULL,
    slug character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.genres ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.genres_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: languages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.languages (
    code character(2) NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_entries (
    id bigint NOT NULL,
    parent_id bigint,
    name text NOT NULL,
    slug character varying(255) NOT NULL,
    path public.ltree NOT NULL,
    tags text[] DEFAULT ARRAY[]::text[] NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: media_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.media_entries ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.media_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: media_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_metadata (
    entry_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    value jsonb DEFAULT 'null'::jsonb NOT NULL
);


--
-- Name: publishers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.publishers (
    id bigint NOT NULL,
    name text NOT NULL,
    country_code character(2),
    image_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: publishers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.publishers ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.publishers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authors authors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_pkey PRIMARY KEY (id);


--
-- Name: book_authors book_authors_book_id_author_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_authors
    ADD CONSTRAINT book_authors_book_id_author_id_key UNIQUE (book_id, author_id);


--
-- Name: book_genres book_genres_book_id_genre_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_genres
    ADD CONSTRAINT book_genres_book_id_genre_id_key UNIQUE (book_id, genre_id);


--
-- Name: book_languages book_languages_book_id_language_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_languages
    ADD CONSTRAINT book_languages_book_id_language_code_key UNIQUE (book_id, language_code);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: books books_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_slug_key UNIQUE (slug);


--
-- Name: countries countries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT countries_pkey PRIMARY KEY (code);


--
-- Name: draft_books draft_books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.draft_books
    ADD CONSTRAINT draft_books_pkey PRIMARY KEY (uuid);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: genres genres_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_slug_key UNIQUE (slug);


--
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_code_key UNIQUE (code);


--
-- Name: media_entries media_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_entries
    ADD CONSTRAINT media_entries_pkey PRIMARY KEY (id);


--
-- Name: media_metadata media_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_metadata
    ADD CONSTRAINT media_metadata_pkey PRIMARY KEY (entry_id, name);


--
-- Name: publishers publishers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT publishers_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (uuid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: media_entries_path_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX media_entries_path_unique ON public.media_entries USING btree (path) WHERE (deleted_at IS NULL);


--
-- Name: media_entries set_media_entry_path; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_media_entry_path BEFORE INSERT OR UPDATE OF parent_id, slug ON public.media_entries FOR EACH ROW EXECUTE FUNCTION public.set_media_entry_path();


--
-- Name: authors authors_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authors
    ADD CONSTRAINT authors_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code) ON DELETE SET NULL;


--
-- Name: book_authors book_authors_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_authors
    ADD CONSTRAINT book_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;


--
-- Name: book_authors book_authors_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_authors
    ADD CONSTRAINT book_authors_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_genres book_genres_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_genres
    ADD CONSTRAINT book_genres_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_genres book_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_genres
    ADD CONSTRAINT book_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE CASCADE;


--
-- Name: book_languages book_languages_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_languages
    ADD CONSTRAINT book_languages_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_languages book_languages_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_languages
    ADD CONSTRAINT book_languages_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.languages(code) ON DELETE CASCADE;


--
-- Name: books books_publisher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(id) ON DELETE SET NULL;


--
-- Name: draft_books draft_books_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.draft_books
    ADD CONSTRAINT draft_books_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id);


--
-- Name: media_entries media_entries_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_entries
    ADD CONSTRAINT media_entries_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.media_entries(id);


--
-- Name: media_metadata media_metadata_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_metadata
    ADD CONSTRAINT media_metadata_entry_id_fkey FOREIGN KEY (entry_id) REFERENCES public.media_entries(id);


--
-- Name: publishers publishers_country_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.publishers
    ADD CONSTRAINT publishers_country_code_fkey FOREIGN KEY (country_code) REFERENCES public.countries(code) ON DELETE SET NULL;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--



--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260622073950'),
    ('20260622074501'),
    ('20260628100600'),
    ('20260628100606'),
    ('20260628100706'),
    ('20260628180019'),
    ('20260628180100'),
    ('20260628190608'),
    ('20260719020000'),
    ('20260728013000'),
    ('20260728020500'),
    ('20260808033538');
