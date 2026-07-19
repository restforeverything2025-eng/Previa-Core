import {
  createProduct
} from "../../src/index.js";

const product = createProduct({
  sku: "TEST001",
  name: "Test Product",
  price: "100"
});

console.log(product);