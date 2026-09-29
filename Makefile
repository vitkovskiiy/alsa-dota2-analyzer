.PHONY: build run dev test clean

# Змінні
PORT ?= 3000

# Збірка TypeScript
build:
	npm run build

# Розробка (hot reload)
dev:
	npm run dev

# Запуск білда
run: build
	npm start

# Перевірка здоров'я сервера (в іншому терміналі)
check-health:
	curl http://localhost:$(PORT)/health

# Тестування (заглушка на майбутнє)
test:
	npm run test

# Очищення
clean:
	rm -rf dist/
	rm -rf node_modules/
