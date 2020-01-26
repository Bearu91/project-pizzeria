/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id,data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      
      
    }

    renderInMenu(){
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }
    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', thisProduct.processOrder());

    }
    getElements(){
      const thisProduct = this;

      thisProduct.imageWrapper=thisProduct.element.querySelector(select.menuProduct.imageWrapper)
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    addToCart() {
      const thisProduct = this;
      app.cart.add(thisProduct);
    }
    
  
    initAccordion() {
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.element.classList.toggle('active');
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        for (let activeProduct of activeProducts) {
          if (activeProduct != thisProduct.element) {
            activeProduct.classList.remove('active');
          }
        }
      });
    }
    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      thisProduct.params = {};
      let price = thisProduct.data.price;
      for (let paramId in thisProduct.data.params) {
        const params = thisProduct.data.params[paramId];
        for (let optionId in params.options) {
          const option = params.options[optionId];

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          const imgProduct = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if (imgProduct) {
            if (optionSelected)
              imgProduct.classList.add(classNames.menuProduct.imageVisible);
            else imgProduct.classList.remove(classNames.menuProduct.imageVisible);
          }
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: paramId.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;


          if (optionSelected && !option.default) {
            price += option.price;
          }
          else if (!optionSelected && option.default) {
            price -= option.price;
          }

        }

      }
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      thisProduct.priceElem.innerHTML = thisProduct.price;
      //console.log(thisProduct.params)
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);

      if (thisWidget.value !== newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }
    initActions() {

      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function () {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);// eslint-disable-line
      });

      thisWidget.linkIncrease.addEventListener('click', function () {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);// eslint-disable-line
      });
    }

    announce() {
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }




    class AmountWidget {
      constructor(element) {
        const thisWidget = this;

        thisWidget.getElements(element);
        thisWidget.value = settings.amountWidget.defaultValue;
        thisWidget.setValue(thisWidget.input.value);
        thisWidget.initActions();
  
        
  
        //console.log('AmountWidget:', AmountWidget);
        //console.log('constructor arguments:', element);
    }
  
    
  }
  

  const app = {
    initMenu: function(){
      const thisApp = this;

      

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
      thisApp.productList = document.querySelector(select.containerOf.menu);
  
      thisApp.productList.addEventListener('add-to-cart', function (event) {
        app.cart.add(event.detail.product);
      });
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
