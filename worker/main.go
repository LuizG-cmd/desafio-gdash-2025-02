package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/rabbitmq/amqp091-go"
)


// WeatherData representa os dados meteorológicos
type WeatherData struct {
	
	CollectedAt       string `json:"collectedAt"`       
	ForecastTime      string `json:"forecastTime"`      
	ForecastTimestamp int64  `json:"forecastTimestamp"` 
	
	// Localização
	City    string `json:"city"`    
	Country string `json:"country"` 
	
	// Dados meteorológicos principais
	Temperature float64 `json:"temperature"` 
	FeelsLike   float64 `json:"feelsLike"`   
	TempMin     float64 `json:"tempMin"`     
	TempMax     float64 `json:"tempMax"`     
	Humidity    int     `json:"humidity"`    
	
	// Condições do tempo
	WeatherCondition   string `json:"weatherCondition"`   
	WeatherDescription string `json:"weatherDescription"` 
	
	// Dados para detecção de chuva e alertas
	RainProbability float64 `json:"rainProbability"` 
	RainVolume      float64 `json:"rainVolume"`      
	
	// Outros dados úteis
	Cloudiness int     `json:"cloudiness"` 
	WindSpeed  float64 `json:"windSpeed"`  
	Visibility int     `json:"visibility"` 
}

// Config armazena configurações do worker
type Config struct {
	RabbitMQURL string
	QueueName   string
	APIURL      string
	MaxRetries  int
}

// Worker gerencia o consumo da fila
type Worker struct {
	config Config
	conn   *amqp091.Connection
	ch     *amqp091.Channel
}

// NewWorker cria uma nova instância do worker
func NewWorker(config Config) (*Worker, error) {
	conn, err := amqp091.Dial(config.RabbitMQURL)
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar ao RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("falha ao abrir canal: %w", err)
	}

	// Declara a fila
	_, err = ch.QueueDeclare(
		config.QueueName,
		true,  
		false, 
		false, 
		false, 
		nil,   
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("falha ao declarar fila: %w", err)
	}

	// Define QoS (processa 1 mensagem por vez)
	err = ch.Qos(1, 0, false)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("falha ao configurar QoS: %w", err)
	}

	return &Worker{
		config: config,
		conn:   conn,
		ch:     ch,
	}, nil
}

// ValidateData valida os dados meteorológicos
func (w *Worker) ValidateData(data *WeatherData) error {
	if data.City == "" {
		return fmt.Errorf("cidade é obrigatória")
	}
	if data.CollectedAt == "" {
		return fmt.Errorf("timestamp é obrigatório")
	}
	return nil
}

// SendToAPI envia os dados para a API NestJS
func (w *Worker) SendToAPI(data *WeatherData) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("erro ao serializar JSON: %w", err)
	}

	for attempt := 1; attempt <= w.config.MaxRetries; attempt++ {
		resp, err := http.Post(
			w.config.APIURL,
			"application/json",
			bytes.NewBuffer(jsonData),
		)

		if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
			resp.Body.Close()
			log.Printf("✅ Dados enviados com sucesso para a API (tentativa %d/%d)", attempt, w.config.MaxRetries)
			return nil
		}

		if resp != nil {
			resp.Body.Close()
		}

		if attempt < w.config.MaxRetries {
			waitTime := time.Duration(attempt) * 2 * time.Second
			log.Printf("⚠️  Tentativa %d/%d falhou, aguardando %v...", attempt, w.config.MaxRetries, waitTime)
			time.Sleep(waitTime)
		}
	}

	return fmt.Errorf("falha após %d tentativas", w.config.MaxRetries)
}

// ProcessMessage processa uma mensagem da fila
func (w *Worker) ProcessMessage(body []byte) error {
	var data WeatherData
	err := json.Unmarshal(body, &data)
	if err != nil {
		return fmt.Errorf("erro ao fazer parse do JSON: %w", err)
	}

	log.Printf("📦 Processando dados: %s - %.1f°C", data.City, data.Temperature)

	// Valida os dados
	if err := w.ValidateData(&data); err != nil {
		return fmt.Errorf("validação falhou: %w", err)
	}

	// Envia para a API
	if err := w.SendToAPI(&data); err != nil {
		return fmt.Errorf("falha ao enviar para API: %w", err)
	}

	return nil
}

// Start inicia o consumo da fila
func (w *Worker) Start() error {
	msgs, err := w.ch.Consume(
		w.config.QueueName,
		"",    
		false, 
		false, 
		false, 
		false, 
		nil,   
	)
	if err != nil {
		return fmt.Errorf("falha ao registrar consumidor: %w", err)
	}

	log.Println("🚀 Worker iniciado, aguardando mensagens...")
	log.Println("📋 Pressione CTRL+C para encerrar")

	forever := make(chan bool)

	go func() {
		for d := range msgs {
			err := w.ProcessMessage(d.Body)
			if err != nil {
				log.Printf("❌ Erro ao processar mensagem: %v", err)
				// Rejeita e reenvia para a fila
				d.Nack(false, true)
			} else {
				// Confirma processamento
				d.Ack(false)
			}
		}
	}()

	<-forever
	return nil
}

// Close fecha as conexões
func (w *Worker) Close() {
	if w.ch != nil {
		w.ch.Close()
	}
	if w.conn != nil {
		w.conn.Close()
	}
}

func main() {
	config := Config{
		RabbitMQURL: "amqp://guest:guest@localhost:5672/",
		QueueName:   "weather_queue",
		APIURL:      "http://localhost:3000/api/weather/logs",
		MaxRetries:  3,
	}

	worker, err := NewWorker(config)
	if err != nil {
		log.Fatalf("❌ Erro ao criar worker: %v", err)
	}
	defer worker.Close()

	if err := worker.Start(); err != nil {
		log.Fatalf("❌ Erro ao iniciar worker: %v", err)
	}
}

