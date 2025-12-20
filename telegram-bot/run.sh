#!/bin/bash

# Загружаем переменные из .env если файл существует
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Запускаем бота
python3 bot.py
