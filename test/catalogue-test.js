const chai = require("chai");
const Catalogue = require("../src/productCatalogue");
const Product = require("../src/product");

const expect = chai.expect;
let cat = null;
let batch = null;

describe("Catalogue", () => {
  beforeEach( () => {
    cat = new Catalogue("Test Catalogue");
    cat.addProduct(new Product("A123", "Product 1", 100, 10, 10.0));
    cat.addProduct(new Product("A124", "Product 2", 100, 10.0));
    cat.addProduct(new Product("A125", "Product 3", 100, 10, 10.0));
    console.log('before block')
  });
  describe("findProductById", function () {
    it("should find a valid product id", function () {
      const result = cat.findProductById("A123");
      expect(result.name).to.equal("Product 1");
    });
    it("should return undefined for invalid product id", function () {
      const result = cat.findProductById("A321");
      expect(result).to.be.undefined;
    });
  });
  describe("removeProductById", () => {
    it("should remove product with a valid id", () => {
      let result = cat.removeProductById("A123");
      expect(result.id).to.equal("A123");
      // Check target state
      result = cat.findProductById("A123");
      expect(result).to.be.undefined;
    });
    it("should return undefined when product id is invalid.", () => {
      const result = cat.removeProductById("A321");
      expect(result).to.be.undefined;
    });
  });
  describe("checkReorder", () => {
    it("should return an empty array when no products need reordering", function () {
      const result = cat.checkReorders();
      expect(result.productIds).to.be.empty;
    });
    it("should report products that satisfy the reorder criteria", function () {
      cat.addProduct(new Product("B123", "Product 4", 10, 20, 10.0));
      cat.addProduct(new Product("B124", "Product 5", 10, 30, 10.0));
      const result = cat.checkReorders();
      expect(result.productIds).to.have.lengthOf(2);
      expect(result.productIds).to.have.members(["B123", "B124"]);
    });
    it("should include products just on their reorder level", function () {
      cat.addProduct(new Product("B125", "Product 6", 10, 10, 10.0));
      const result = cat.checkReorders();
      expect(result.productIds).to.have.lengthOf(1);
      expect(result.productIds).to.have.members(["B125"]);
    });
    it("should handle the empty catalogue case", function () {
       cat = new Catalogue("Test Catalogue")
       const result = cat.checkReorders();
       expect(result.productIds).to.be.empty;
     });
  });
  describe("batchAddProducts", () => {
    beforeEach(function () {
      batch = {
        type: 'Batch',
        products: [
          new Product("A126", "Product 6", 100, 10, 10.0),
          new Product("A127", "Product 7", 100, 10, 10.0),
        ],
      };
    });
    it("should update the catalogue for a normal request and return the number added", () => {
      const result = cat.batchAddProducts(batch);
      expect(result).to.equal(2);
      let addedProduct = cat.findProductById("A126");
      expect(addedProduct).to.not.be.undefined;
      addedProduct = cat.findProductById("A127");
      expect(addedProduct).to.not.be.undefined;
    });
    it("should only add products with a non-zero quantity in stock", () => {
      batch.products.push(new Product("A128", "Product 8", 0, 10, 10.0));
      const result = cat.batchAddProducts(batch);
      expect(result).to.equal(2);
      const rejectedProduct = cat.findProductById("A128");
      expect(rejectedProduct).to.be.undefined;
    });
    it("should throw an exception when batch includes an existing product id", () => {
      batch.products.push(new Product("A123", "Product 9", 0, 10, 10.0));
      expect(() => cat.batchAddProducts(batch)).to.throw("Bad Batch");
      // Target state
      let rejectedProduct = cat.findProductById("A126");
      expect(rejectedProduct).to.be.undefined; 
    });
    describe("search", () => {
        beforeEach(function () {
            cat = new Catalogue("Test Catalogue");
            cat.addProduct(new Product("C123", "shoes", 100, 10, 25.0));
            cat.addProduct(new Product("C124", "shoulder bag", 100, 10, 10.0));
            cat.addProduct(new Product("C125", "book", 100, 10, 30.0));
        });
        it("returns the products whose price is less than (or equal to) the specified value", () => {
            const result = cat.search({price: 25.00});
            expect(result).to.have.lengthOf(2);
            expect(result).to.have.members(["C123", "C124"]);
        });
        it("returns the products with the keyword in their name when they fits keyword", () => {
            const result = cat.search({keyword: 'sho'})
            expect(result).to.have.lengthOf(2);
            expect(result[0].name).to.equal("shoes");
        });
        it("returns an exception 'Bad search' if the criteria object has neither key", () => {
            expect(() => cat.search('dante')).to.throw("Bad Batch");
        });
    })
  });
});
