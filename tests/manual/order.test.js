import {
  Order,
  OrderItem,
  validateOrder,
  validate,
  OrderService,
  OrderRepository,
  MemoryOrderRepository
} from "../../src/index.js";

const order = new Order({
  order_id: "TEST-001",
  source: "telegram",
  provider: "telegram",
  providerId: "1234567890",
  customer_name: "Test Customer",
  phone: "+380000000000",
  email: "test@example.com",
  payment_type: "full",
  payment_method: "card"
});

const item = new OrderItem({
  order_id: "TEST-001",
  sku: "W0001",
  title: "Test Watch",
  price: 100,
  quantity: 1,
  subtotal: 100
});

console.log("Order:");
console.log(order);

console.log("OrderItem:");
console.log(item);

const validationErrors = validateOrder(order);

console.log("Validation errors:");
console.log(validationErrors);

const serviceValidationErrors =
  validate("order", order);

console.log("ValidationService errors:");
console.log(serviceValidationErrors);

const orderService =
  new OrderService();

const createdOrder =
  orderService.createOrder({
    order_id: "TEST-002",
    source: "telegram",
    provider: "telegram",
    providerId: "1234567890",
    customer_name: "Test Customer",
    phone: "+380000000000",
    email: "test@example.com",
    payment_type: "full",
    payment_method: "card",

    items: [
      {
        sku: "W0001",
        title: "Test Watch",
        price: 100,
        quantity: 1
      }
    ]
  });

console.log("OrderService result:");
console.log(createdOrder);

const repository =
  new OrderRepository();

console.log("Repository:");

try {

  repository.save(
    createdOrder.order,
    createdOrder.items
  );

} catch (error) {

  console.log(error.message);

}

const memoryRepository =
  new MemoryOrderRepository();

const memoryService =
  new OrderService(memoryRepository);

const savedOrder =
  await memoryService.saveOrder({
    order_id: "TEST-003",
    source: "telegram",
    provider: "telegram",
    providerId: "1234567890",
    customer_name: "Test Customer",
    phone: "+380000000000",
    email: "test@example.com",
    payment_type: "full",
    payment_method: "card",

    items: [
      {
        sku: "W0002",
        title: "Test Vintage Watch",
        price: 250,
        quantity: 1
      }
    ]
  });

console.log("Saved Order:");
console.log(savedOrder);

const foundOrder =
  memoryRepository.findById("TEST-003");

console.log("Found Order:");
console.log(foundOrder);