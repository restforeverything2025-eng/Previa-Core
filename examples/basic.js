import {
  createProduct
} from "../src/index.js";

const product = createProduct({

  sku: "W0001",

  name: "Rolex Datejust",

  price: "1500"

});

console.log(product);