import { Kafka, Producer, Consumer, Admin, logLevel } from "kafkajs";
import  {loadEnvFile} from "node:process";

loadEnvFile()
class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer | null = null;
  private admin: Admin;

  constructor() {
    this.kafka = new Kafka({
      clientId: "book-stream-api",
      brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
      logLevel: logLevel.INFO,
    });

    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
  }

  async connectProducer() {
    await this.producer.connect();
    console.log("✅ Kafka Producer connected");
  }

  async sendMessage(topic: string, message: unknown) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
  async createTopic(topic: string) {
    await this.admin.connect();

    const topics = await this.admin.listTopics();
    if (!topics.includes(topic)) {
      await this.admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: 3,
            replicationFactor: 1,
          },
        ],
      });
    }

    await this.admin.disconnect();
  }

  async startConsumer(
    topic: string,
    groupId: string,
    handler: (message: any) => Promise<void>
  ) {
    this.consumer = this.kafka.consumer({ groupId });

    await this.consumer.connect();
    await this.consumer.subscribe({ topic });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const parsed = JSON.parse(message.value!.toString());
        await handler(parsed);
      },
    });
  }

  async disconnect() {
    await this.producer.disconnect();
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}

export default new KafkaService();