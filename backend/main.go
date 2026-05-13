package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	// TODO task-0: разкомментируй импорт после того как добавишь пакет
	// "github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	port := os.Getenv("HTTP_PORT")
	if port == "" {
		port = "8080"
	}

	// TODO task-0: получи DATABASE_URL из окружения
	// dbURL := os.Getenv("DATABASE_URL")
	// if dbURL == "" {
	// 	 log.Fatal("DATABASE_URL is not set")
	// }

	// TODO task-0: создай пул соединений
	// pool, err := pgxpool.New(context.Background(), dbURL)
	// if err != nil {
	// 	 log.Fatalf("cannot connect to database: %v", err)
	// }
	// defer pool.Close()

	// TODO task-0: проверь соединение через Ping
	// if err := pool.Ping(context.Background()); err != nil {
	// 	 log.Fatalf("database ping failed: %v", err)
	// }
	// log.Println("Connected to database")

	mux := http.NewServeMux()

	// GET /api/ping
	// TODO task-0: после подключения БД добавь проверку через pool.Ping()
	// и возвращай поле "db": "ok" или "db": "error" в ответе
	mux.HandleFunc("/api/ping", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "pong",
			"db":      "not connected", // TODO task-0: замени на реальный статус
		})
	})

	log.Printf("Backend listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
