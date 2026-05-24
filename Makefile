FRONTEND_DIR ?= frontend
BACKEND_DIR ?= backend
SUPABASE_SCHEMA ?= public
SUPABASE_TYPES ?= $(FRONTEND_DIR)/src/lib/database.types.ts
SUPABASE_PROJECT_REF ?=
SUPABASE ?= npx supabase

.PHONY: help install format supabase-login supabase-init supabase-link supabase-start supabase-stop supabase-types supabase-db-push supabase-db-reset supabase-migration

help:
	@printf "Targets:\n"
	@printf "  install               Install frontend and backend dependencies\n"
	@printf "  format                Format frontend files with Prettier and backend files with Ruff\n"
	@printf "  supabase-login        Authenticate the Supabase CLI\n"
	@printf "  supabase-init         Create local supabase/config.toml\n"
	@printf "  supabase-link         Link to remote project: make supabase-link SUPABASE_PROJECT_REF=...\n"
	@printf "  supabase-start        Start local Supabase containers\n"
	@printf "  supabase-stop         Stop local Supabase containers\n"
	@printf "  supabase-migration    Create migration: make supabase-migration name=create_profiles\n"
	@printf "  supabase-db-push      Push local migrations to linked project\n"
	@printf "  supabase-db-reset     Reset local database from migrations\n"
	@printf "  supabase-types        Generate TypeScript DB types into $(SUPABASE_TYPES)\n"

install:
	cd $(BACKEND_DIR) && uv sync --dev
	cd $(FRONTEND_DIR) && npm ci

format:
	npm run format --prefix $(FRONTEND_DIR)
	cd $(BACKEND_DIR) && uv run ruff format .

supabase-login:
	$(SUPABASE) login

supabase-init:
	$(SUPABASE) init

supabase-link:
	@if [ -z "$(SUPABASE_PROJECT_REF)" ]; then \
		printf "Set SUPABASE_PROJECT_REF, for example: make supabase-link SUPABASE_PROJECT_REF=abcdefghijklmnopqrst\n"; \
		exit 1; \
	fi
	$(SUPABASE) link --project-ref $(SUPABASE_PROJECT_REF)

supabase-start:
	$(SUPABASE) start

supabase-stop:
	$(SUPABASE) stop

supabase-migration:
	@if [ -z "$(name)" ]; then \
		printf "Set a migration name, for example: make supabase-migration name=create_profiles\n"; \
		exit 1; \
	fi
	$(SUPABASE) migration new $(name)

supabase-db-push:
	$(SUPABASE) db push

supabase-db-reset:
	$(SUPABASE) db reset

supabase-types:
	$(SUPABASE) gen types typescript --linked --schema $(SUPABASE_SCHEMA) > $(SUPABASE_TYPES)
