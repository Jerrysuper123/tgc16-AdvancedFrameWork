const express = require("express");
const router = express.Router();

const { Product, Category, Tag } = require("../models");
const {
  bootstrapField,
  createProductForm,
  createSearchForm,
} = require("../forms");
const { checkIfAuthenticated } = require("../middlewares");

router.get("/", async (req, res) => {
  const allCategories = (await Category.fetchAll()).map((category) => {
    return [category.get("id"), category.get("name")];
  });

  allCategories.unshift([0, "----"]);

  const allTags = (await Tag.fetchAll()).map((tag) => {
    return [tag.get("id"), tag.get("name")];
  });

  let searchForm = createSearchForm(allCategories, allTags);

  let q = Product.collection();

  searchForm.handle(req, {
    empty: async (form) => {
      let products = await q.fetch({
        withRelated: ["category", "tags"],
      });
      res.render("products/index", {
        products: products.toJSON(),
        form: form.toHTML(bootstrapField),
      });
    },
    error: async (form) => {
      let products = await q.fetch({
        withRelated: ["category", "tags"],
      });
      res.render("products/index", {
        products: products.toJSON(),
        form: form.toHTML(bootstrapField),
      });
    },
    success: async (form) => {
      if (form.data.name) {
        q = q.where("name", "like", "%" + req.query.name + "%");
      }

      //if user selected one of the category
      if (form.data.category_id && form.data.category_id !== "0") {
        //products table join categories table where category_id===categories.id
        q.where("category_id", "=", form.data.category_id);
      }

      if (form.data.min_cost) {
        q = q.where("cost", ">=", req.query.min_cost);
      }

      if (form.data.max_cost) {
        q = q.where("cost", "<=", req.query.max_cost);
      }

      if (form.data.tags) {
        q.query("join", "products_tags", "products.id", "product_id").where(
          "tag_id",
          "in",
          form.data.tags.split(",")
        );
        console.log("tag query string", q);
      }

      let products = await q.fetch({
        withRelated: ["category", "tags"],
      });

      res.render("products/index", {
        products: products.toJSON(),
        form: form.toHTML(bootstrapField),
      });
    },
  });

  // let products = await Product.collection().fetch({
  //   //append cat into product table
  //   withRelated: ["category", "tags"],
  //   //append tags to the products
  // });
  // console.log("products", products.toJSON());
  // res.render("products/index", {
  //   //convert data into json format
  //   products: products.toJSON(),
  // });
});

const getAllTags = async () => {
  const allTags = await Tag.fetchAll().map((tag) => {
    return [tag.get("id"), tag.get("name")];
  });
  return allTags;
};

router.get("/create", checkIfAuthenticated, async (req, res) => {
  // const allCategories = await Category.fetchAll().map((cat) => {
  //   return [cat.get("id"), cat.get("name")];
  // });
  console.log("see create table");
  const allCategories = await getAllCategories();
  const allTags = await getAllTags();

  const productForm = createProductForm(allCategories, allTags);
  res.render("products/create", {
    form: productForm.toHTML(bootstrapField),
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});

router.post("/create", async (req, res) => {
  console.log("see post data");
  const allCategories = await getAllCategories();

  const productForm = createProductForm(allCategories);

  console.log(req.body);

  productForm.handle(req, {
    success: async (form) => {
      // create a new row for the Product modal
      console.log("posted to products successfully");
      //separate tag info with other form data info
      let { tags, ...productData } = form.data;
      const product = new Product(productData);
      //save each row
      await product.save();

      //save m to m relationship
      if (tags) {
        //caolan form return tags in the format a,b,c
        //so we convert them into an array [a,b,c] before attaching
        //new row product, call tags() relationship then attach the tags data
        await product.tags().attach(tags.split(","));
      }

      //creation of a flash message
      req.flash(
        "success_messages",
        `New product ${product.get("name")} has been created`
      );

      res.redirect("/products");
    },

    // render the orignal form if there is error
    error: async (form) => {
      console.log("posted to products failed");

      res.render("products/create", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

const getAllCategories = async () => {
  const allCategories = await Category.fetchAll().map((cat) => {
    return [cat.get("id"), cat.get("name")];
  });
  return allCategories;
};

router.get("/:product_id/update", async (req, res) => {
  const productId = req.params.product_id;
  const product = await Product.where({
    id: parseInt(productId),
  }).fetch({
    require: true,
    withRelated: ["tags", "category"],
  });

  const allTags = await getAllTags();
  const allCategories = await getAllCategories();

  const productForm = createProductForm(allCategories, allTags);

  productForm.fields.name.value = product.get("name");
  productForm.fields.cost.value = product.get("cost");
  productForm.fields.description.value = product.get("description");
  productForm.fields.category_id.value = product.get("category_id");
  productForm.fields.image_url.value = product.get("image_url");

  //fill in the multi-select for the tags
  //pluck allows you to retrieve one field only (like mongo projection)
  //or you can use map to filter out the id only
  let selectedTags = await product.related("tags").pluck("id");
  console.log("tags", selectedTags);
  productForm.fields.tags.value = selectedTags;

  res.render("products/update", {
    form: productForm.toHTML(bootstrapField),
    product: product.toJSON(),
    cloudinaryName: process.env.CLOUDINARY_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});

router.post("/:product_id/update", async (req, res) => {
  const allCategories = await getAllCategories();

  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
    withRelated: ["tags"],
  });

  //process the form
  const productForm = createProductForm(allCategories);
  productForm.handle(req, {
    success: async (form) => {
      // everything else goes into ...productData
      let { tags, ...productData } = form.data;
      product.set(productData);
      product.save();

      //tags will just be ids of string
      let selectedTagIDs = tags.split(",");

      //find existing tags
      let existingTags = await product.related("tags").pluck("id");

      //remove existing tags
      let toRemove = existingTags.filter(
        (id) => selectedTagIDs.includes(id) === false
      );

      //detach is to remove relationship
      await product.tags().detach(toRemove);

      //add in all the tags
      await product.tags().attach(selectedTagIDs);

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
