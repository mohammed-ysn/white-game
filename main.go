package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)
var clientsLock sync.Mutex

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading connection:", err)
		return
	}
	defer conn.Close()

	clientsLock.Lock()
	clients[conn] = true
	clientsLock.Unlock()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			clientsLock.Lock()
			delete(clients, conn)
			clientsLock.Unlock()
			break
		}

		// Broadcast "HELLO" message to all clients, except one random connection
		clientsLock.Lock()
		index := rand.Intn(len(clients))
		i := 0
		for client := range clients {
			if i == index {
				_ = client.WriteMessage(websocket.TextMessage, []byte("WHITE"))
			} else {
				_ = client.WriteMessage(websocket.TextMessage, []byte("HELLO"))
			}
			i++
		}
		clientsLock.Unlock()
	}
}

func main() {
	http.HandleFunc("/ws", handleWebSocket)
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/", fs)

	fmt.Println("Server started at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
