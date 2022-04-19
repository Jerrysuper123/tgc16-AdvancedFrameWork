const forms = require("forms");

//what kind of field, string, dateTime etc
const fields = forms.fields;
//for validation purpose
const validators = forms.validators;
const widgets = forms.widgets;

//boostrap style below
var bootstrapField = function (name, object) {
  if (!Array.isArray(object.widget.classes)) {
    object.widget.classes = [];
  }

  if (object.widget.classes.indexOf("form-control") === -1) {
    object.widget.classes.push("form-control");
  }

  var validationclass = object.value && !object.error ? "is-valid" : "";
  validationclass = object.error ? "is-invalid" : validationclass;
  if (validationclass) {
    object.widget.classes.push(validationclass);
  }

  var label = object.labelHTML(name);
  var error = object.error
    ? '<div class="invalid-feedback">' + object.error + "</div>"
    : "";

  var widget = object.widget.toHTML(name, object);
  return '<div class="form-group">' + label + widget + error + "</div>";
};

const createProductForm = (categories, tags) => {
  return forms.create({
    name: fields.string({
      required: true,
      errorAfterField: true,
    }),
    cost: fields.string({
      required: true,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    description: fields.string({
      required: true,
      errorAfterField: true,
    }),
    category_id: fields.string({
      // we put label as Category, so taht category_id will not be the label
      label: "Category",
      required: true,
      errorAfterField: true,
      widget: widgets.select(),
      choices: categories,
    }),
    tags: fields.string({
      required: true,
      errorAfterField: true,
      widget: widgets.multipleSelect(),
      choices: tags, //tags must be in the form of [[1: "snack"],[2: "healthy"]]
    }),
    image_url: fields.string({
      widget: widgets.hidden(),
    }),
  });
};

//this creates an template for the register form
const createRegistrationForm = () => {
  return forms.create({
    username: fields.string({
      required: true,
      errorAfterField: true,
    }),
    email: fields.string({
      required: true,
      errorAfterField: true,
    }),
    password: fields.password({
      required: true,
      errorAfterField: true,
    }),
    confirm_password: fields.password({
      required: true,
      errorAfterField: true,
      validators: [validators.matchField("password")],
    }),
  });
};

const createLoginForm = () => {
  return forms.create({
    email: fields.string({
      required: true,
      errorAfterField: true,
    }),
    password: fields.password({
      required: true,
      errorAfterField: true,
    }),
  });
};

const createSearchForm = (categories, tags) => {
  return forms.create({
    name: fields.string({
      required: false,
      errorAfterField: true,
    }),
    min_cost: fields.string({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    max_cost: fields.string({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    category_id: fields.string({
      label: "Category",
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: categories,
    }),
    tags: fields.string({
      required: false,
      errorAfterField: true,
      widget: widgets.multipleSelect(),
      choices: tags,
    }),
  });
};

module.exports = {
  createProductForm,
  bootstrapField,
  createRegistrationForm,
  createLoginForm,
  createSearchForm,
};
