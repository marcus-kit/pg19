# CI/CD Setup для PG19

## Текущий статус (29.12.2024)

CI/CD настроен, но требует отладки деплоя на Vercel.

## Структура проекта после рефакторинга

```
main                    ← Основная ветка (продакшен)
└── dev                 ← Ветка разработки

apps/
├── client-portal/      → pg19-client.vercel.app
├── admin-panel/        → pg19-admin.vercel.app
├── landing/            → pg19-land.vercel.app
└── landingv2/          → landingv2.vercel.app (новый)
```

## GitHub Actions Workflow

Файл: `.github/workflows/deploy.yml`

### Что делает:
1. **typecheck** — проверяет TypeScript во всех apps
2. **deploy-*** — деплоит каждое приложение параллельно на Vercel

### Триггеры:
- Push в `main` — полный деплой
- Pull Request в `main` — только typecheck

## GitHub Secrets

Добавлены в репозиторий:

| Secret | Описание |
|--------|----------|
| `VERCEL_TOKEN` | API токен Vercel |
| `VERCEL_ORG_ID` | `team_WkDA5BNb1zCLVgGOvyIzAdv0` |
| `VERCEL_PROJECT_ID_CLIENT` | `prj_lQge6N1DJKp9uJwmiH27cRFSoePC` |
| `VERCEL_PROJECT_ID_ADMIN` | `prj_KxVu2SSHMkOIwub0NIGJKJCy6jqo` |
| `VERCEL_PROJECT_ID_LANDING` | `prj_vzmIrzs4XZVAyg6qy5ikALT5j1DR` |
| `VERCEL_PROJECT_ID_LANDINGV2` | `prj_Ex4YmLdzdTQGp5F03LYoUCwo90aJ` |

## Vercel Project Linking

Каждый app привязан к Vercel проекту через `vercel link`:

```bash
cd apps/client-portal && vercel link --project pg19-client
cd apps/admin-panel && vercel link --project pg19-admin
cd apps/landing && vercel link --project pg19-land
cd apps/landingv2 && vercel link --project landingv2
```

## Известные проблемы

### 1. Git author check
**Ошибка:** `Git author must have access to the team`
**Решение:** Используем `amondnet/vercel-action@v25` вместо Vercel CLI

### 2. Output directory
**Ошибка:** `No Output Directory named "dist" found`
**Причина:** Nuxt билдит в `.output/`, Vercel ждёт `dist/`
**Решение:** Дать Vercel билдить самому (не использовать `--prebuilt`)

### 3. Temporary Vercel errors
**Ошибка:** `Unexpected error. Please try again later`
**Решение:** Перезапустить workflow: `gh run rerun <run_id> --failed`

## Ручной деплой (если CI не работает)

```bash
# Деплой одного приложения
cd apps/client-portal
vercel --prod

# Или для всех
pnpm -r --filter "./apps/*" exec vercel --prod
```

## Полезные команды

```bash
# Проверить статус последнего workflow
gh run list --limit 1

# Посмотреть детали
gh run view <run_id>

# Перезапустить failed jobs
gh run rerun <run_id> --failed

# Посмотреть логи ошибок
gh run view <run_id> --log-failed
```

## Следующие шаги

1. [ ] Отладить деплой (возможно временная проблема Vercel API)
2. [ ] Настроить branch protection для main
3. [ ] Добавить preview deployments для PR
