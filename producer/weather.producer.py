import json
import time
import requests
import pika
import os
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('OPENWEATHER_API_KEY')
city= os.getenv("CITY")

class WeatherProducer:
    def __init__(self):
        # Configuração RabbitMQ
        self.rabbitmq_host = "localhost"
        self.rabbitmq_port = 5672
        self.queue_name = "weather_queue"
        
        # API de clima (exemplo: OpenWeatherMap)
        self.api_key = api_key
        self.city = city
        self.api_url = f"http://api.openweathermap.org/data/2.5/forecast"
        
    def get_weather_data(self) -> List[Dict[str, Any]]:
        """Busca dados essenciais para análise de IA"""
        try:
            params = {
                "q": self.city,
                "appid": self.api_key,
                "units": "metric",
                "lang": "pt_br"
            }
            
            response = requests.get(self.api_url, params=params)
            response.raise_for_status()
            data = response.json()
            
            forecasts = []
            for item in data["list"]:
                # Extrai dados essenciais para a análise da IA
                forecast = {
                    # Identificação temporal
                    "collectedAt": datetime.utcnow().isoformat(),
                    "forecastTime": item["dt_txt"],
                    "forecastTimestamp": item["dt"],
                    
                    # Localização
                    "city": data["city"]["name"],
                    "country": data["city"]["country"],
                    
                    # Dados meteorológicos principais
                    "temperature": item["main"]["temp"],
                    "feelsLike": item["main"]["feels_like"],
                    "tempMin": item["main"]["temp_min"],
                    "tempMax": item["main"]["temp_max"],
                    "humidity": item["main"]["humidity"],
                    
                    # Condições do tempo
                    "weatherCondition": item["weather"][0]["main"] if item.get("weather") else "Unknown",
                    "weatherDescription": item["weather"][0]["description"] if item.get("weather") else "N/A",
                    
                    # Dados para detecção de chuva e alertas
                    "rainProbability": item.get("pop", 0) * 100,  # Convertido para %
                    "rainVolume": item.get("rain", {}).get("3h", 0),  # mm em 3h
                    
                    # Outros dados úteis
                    "cloudiness": item.get("clouds", {}).get("all", 0),
                    "windSpeed": item.get("wind", {}).get("speed", 0),
                    "visibility": item.get("visibility", 10000)
                }
                
                forecasts.append(forecast)
            
            print(f"📊 Coletadas {len(forecasts)} previsões para {data['city']['name']}")
            return forecasts
            
        except Exception as e:
            print(f"❌ Erro ao buscar dados da API: {e}")
            return None
    
    def send_to_queue(self, forecasts: List[Dict[str, Any]]) -> bool:
        """Envia dados para a fila RabbitMQ"""
        try:
            # Conecta ao RabbitMQ
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=self.rabbitmq_host,
                    port=self.rabbitmq_port
                )
            )
            channel = connection.channel()
            
            # Declara a fila
            channel.queue_declare(queue=self.queue_name, durable=True)

            data = forecasts[0]
            
            # Envia cada previsão individualmente
            for forecast in forecasts:
                message = json.dumps(forecast)
                
                channel.basic_publish(
                    exchange='',
                    routing_key=self.queue_name,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,
                        content_type='application/json'
                    )
            )
            
            print(f"✅ Dados enviados para a fila: {data['city']} - {data['temperature']}°C")
            print(f"Horário:", datetime.utcnow().isoformat())
            
            connection.close()
            return True
            
        except Exception as e:
            print(f"❌ Erro ao enviar para a fila: {e}")
            return False
    
    def run(self, interval_minutes: int = 60):
        """Executa o produtor em loop"""
        print(f"🚀 Iniciando Weather Producer...")
        print(f"📍 Cidade: {self.city}")
        print(f"⏱️  Intervalo: {interval_minutes} minutos")
        print("-" * 50)
        
        while True:
            try:
                # Busca dados
                weather_data = self.get_weather_data()
                
                if weather_data:
                    # Envia para a fila
                    self.send_to_queue(weather_data)
                
                # Aguarda até a próxima execução
                print(f"⏳ Aguardando {interval_minutes} minutos...")
                time.sleep(interval_minutes * 60)
                
            except KeyboardInterrupt:
                print("\n🛑 Produtor encerrado pelo usuário")
                break
            except Exception as e:
                print(f"❌ Erro no loop principal: {e}")
                time.sleep(60)  # Aguarda 1 minuto antes de tentar novamente

if __name__ == "__main__":
    producer = WeatherProducer()
    producer.run(interval_minutes=60)  # Executa a cada 1 hora