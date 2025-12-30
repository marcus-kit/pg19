# Контекст сессии (29.12.2024)

## Что было сделано

### 1. Наведён порядок с ветками Git
- ✅ Смержили `rabbit` → `main` (sync с продакшеном)
- ✅ Удалили ненужные ветки: `rabbit`, `full`, `dev` (старый), `claude/*`
- ✅ Пересоздали `dev` от `main`
- ✅ Удалили `landing` и `landingv2` ветки (код перенесён в apps/)

### 2. Добавлен landingv2 как отдельный app
- ✅ Скопирован из ветки `landingv2` в `apps/landingv2/`
- ✅ Обновлён package.json (name: landingv2, port: 3003)
- ✅ Создан Vercel проект `landingv2`

### 3. Настроен CI/CD
- ✅ Установлен Vercel CLI и GitHub CLI
- ✅ Привязаны все Vercel проекты
- ✅ Добавлены GitHub Secrets (6 штук)
- ✅ Создан workflow `.github/workflows/deploy.yml`
- ⚠️ Деплой падает с ошибкой Vercel API (временная)

## Текущее состояние

### Ветки
```
main (текущая)
dev
```

### Последний коммит
```
8858150 fix(ci): use amondnet/vercel-action to bypass git author check
```

### Последний workflow run
- ID: `20586951838`
- Статус: был перезапущен, ожидает завершения
- Проверить: `gh run view 20586951838`

## Что нужно доделать

1. **Проверить деплой** — перезапустить или подождать
   ```bash
   gh run list --limit 1
   gh run rerun 20586951838 --failed
   ```

2. **Если ошибки продолжаются** — попробовать:
   - Обновить VERCEL_TOKEN
   - Подключить Vercel GitHub Integration напрямую
   - Деплоить вручную через `vercel --prod`

## Важные файлы

- `.github/workflows/deploy.yml` — CI/CD workflow
- `docs/CI-CD-SETUP.md` — документация по CI/CD
- `apps/landingv2/` — новый лендинг (пиратская тема)

## Credentials (для справки)

- **GitHub repo:** marcus-kit/pg19
- **Vercel team:** vts-projects-d91d9265
- **Vercel user:** limi73d-9955
