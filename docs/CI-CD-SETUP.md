# CI/CD Setup для PG19

## Текущий статус: РАБОТАЕТ

Последнее обновление: 30.12.2024

## Архитектура

```
GitHub (push to main)
        │
        ▼
┌───────────────────┐
│  GitHub Actions   │
│                   │
│  1. Type Check    │
│        │          │
│        ▼          │
│  2. Deploy (x4)   │──────┐
│     параллельно   │      │
└───────────────────┘      │
                           ▼
                    ┌─────────────┐
                    │   Vercel    │
                    │             │
                    │ • build     │
                    │ • deploy    │
                    │ • CDN       │
                    └─────────────┘
```

## Приложения и URL

| Приложение | Vercel Project | Production URL |
|------------|----------------|----------------|
| Client Portal | pg19-client | https://pg19-client.vercel.app |
| Admin Panel | pg19-admin | https://pg19-admin.vercel.app |
| Landing | pg19-land | https://pg19-land.vercel.app |
| Landing V2 | landingv2 | https://landingv2-lac.vercel.app |

## Как работает деплой

### Триггеры

| Событие | Что происходит |
|---------|----------------|
| Push в `main` | Typecheck + Deploy всех 4 приложений |
| Pull Request в `main` | Только Typecheck (без деплоя) |

### Этапы

1. **Type Check** — проверка TypeScript во всех приложениях
2. **Deploy** — параллельный деплой 4 приложений на Vercel

### Workflow файл

`.github/workflows/deploy.yml`

```yaml
# Структура джобов:
typecheck          # Проверка типов
  │
  ├── deploy-client     # Параллельный
  ├── deploy-admin      # деплой
  ├── deploy-landing    # всех
  └── deploy-landingv2  # приложений
```

## Конфигурация Vercel для Monorepo

Каждый app имеет `vercel.json`:

```json
{
  "framework": "nuxtjs",
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "pnpm build"
}
```

Настройки проекта на Vercel:
- `rootDirectory`: `apps/<app-name>`
- `sourceFilesOutsideRootDirectory`: `true` (для доступа к общим пакетам)

## GitHub Secrets

| Secret | Назначение |
|--------|------------|
| `VERCEL_TOKEN` | API токен Vercel |
| `VERCEL_ORG_ID` | ID организации Vercel |
| `VERCEL_PROJECT_ID_CLIENT` | ID проекта client-portal |
| `VERCEL_PROJECT_ID_ADMIN` | ID проекта admin-panel |
| `VERCEL_PROJECT_ID_LANDING` | ID проекта landing |
| `VERCEL_PROJECT_ID_LANDINGV2` | ID проекта landingv2 |

## Полезные команды

```bash
# Статус последних workflow
gh run list --limit 5

# Детали конкретного запуска
gh run view <run_id>

# Логи ошибок
gh run view <run_id> --log-failed

# Перезапуск упавших джобов
gh run rerun <run_id> --failed

# Запуск workflow вручную (если настроен workflow_dispatch)
gh workflow run deploy.yml
```

## Решённые проблемы

### 1. Git author access denied
**Ошибка:** `Git author must have access to the team`
**Решение:** Используем `amondnet/vercel-action@v25` вместо прямого Vercel CLI

### 2. Monorepo build
**Ошибка:** `cd ../.. && pnpm install` не работает
**Решение:** Включить `sourceFilesOutsideRootDirectory: true` в настройках проекта Vercel

### 3. Output directory
**Ошибка:** `No Output Directory named "dist" found`
**Решение:** Не использовать `--prebuilt`, дать Vercel билдить самому

## Добавление нового приложения

1. Создать приложение в `apps/new-app/`
2. Добавить `vercel.json`:
   ```json
   {
     "framework": "nuxtjs",
     "installCommand": "cd ../.. && pnpm install",
     "buildCommand": "pnpm build"
   }
   ```
3. Создать проект на Vercel: `vercel link`
4. Настроить на Vercel:
   - Root Directory: `apps/new-app`
   - Source Files Outside Root Directory: ON
5. Добавить secret в GitHub: `VERCEL_PROJECT_ID_NEWAPP`
6. Добавить job в `.github/workflows/deploy.yml`
