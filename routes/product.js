const express = require("express");
const router = express.Router();

const { Product, Category } = require("../models");
const { bootstrapField, createProductForm } = require("../forms");

router.get("/", async (req, res) => {
  let products = await Product.collection().fetch({
    //append cat into product table
    withRelated: ["category"],
  });
  console.log("products", products.toJSON());

  res.render("products/index", {
    //convert data into json format
    products: products.toJSON(),
  });
});

router.get("/create", async (req, res) => {
  // const allCategories = await Category.fetchAll().map((cat) => {
  //   return [cat.get("id"), cat.get("name")];
  // });

  const allCategories = await getAllCategories();

  const productForm = createProductForm(allCategories);
  res.render("products/create", {
    form: productForm.toHTML(bootstrapField),
  });
});

const getAllCategories = async () => {
  const allCategories = await Category.fetchAll().map((cat) => {
    return [cat.get("id"), cat.get("name")];
  });
  return allCategories;
};

router.post("/create", async (req, res) => {
  const allCategories = await getAllCategories();

  const productForm = createProductForm(allCategories);
  productForm.handle(req, {
    success: async (form) => {
      // create a new row for the Product modal
      const product = new Product(form.data);
      //save each row
      await product.save();
      res.redirect("/products");
    },

    // render the orignal form if there is error
    error: async (form) => {
      res.render("products/create", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

router.get("/:product_id/update", async (req, res) => {
  const productId = req.params.product_id;
  const product = await Product.where({
    id: productId,
  }).fetch({
    require: true,
  });

  const allCategories = await getAllCategories();

  const productForm = createProductForm(allCategories);

  productForm.fields.name.value = product.get("name");
  productForm.fields.cost.value = product.get("cost");
  productForm.fields.description.value = product.get("description");
  productForm.fields.category_id.value = product.get("category_id");

  res.render("products/update", {
    form: productForm.toHTML(bootstrapField),
    product: product.toJSON(),
  });
});

router.post("/:product_id/update", async (req, res) => {
  const allCategories = await getAllCategories();

  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });

  //process the form
  const productForm = createProductForm(allCategories);
  productForm.handle(req, {
    success: async (form) => {
      product.set(form.data);
      product.save();
      res.redirect("/products");
    },
    error: async (form) => {
      res.render("products/update", {
        form: form.toHTML(bootstrapField),
        product: product.toJSON(),
      });
    },
  });
});

router.get("/:product_id/delete", async (req, res) => {
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });
  res.render("products/delete", {
    product: product.toJSON(),
  });
});

router.post("/:product_id/delete", async (req, res) => {
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });

  await product.destroy();
  res.redirect("/products");
});

module.exports = router;
