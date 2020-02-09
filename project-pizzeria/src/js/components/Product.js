import {templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
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

  renderInMenu() {
    const thisProduct = this;
    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
    menuContainer.appendChild(thisProduct.element);
  }

    

  getElements() {
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const clickableTrigger = thisProduct.element;
    /* START: click event listener to trigger */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      clickableTrigger.classList.add(classNames.menuProduct.wrapperActive);
      /* find all active products */
      const activeProducts = document.querySelectorAll('.product');
      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != clickableTrigger) {
          /* remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }
    
  initOrderForm(){
    const thisProduct = this;
    thisProduct.form.addEventListener('submit', function (event){
      event.preventDefault();
      thisProduct.processOrder();
    });
    for (let input of thisProduct.formInputs){
      input.addEventListener('change', function (){
        thisProduct.processOrder();
      });
    }
    thisProduct.cartButton.addEventListener('click', function (event){
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
          
          
        if (!thisProduct.params[paramId]) {
          thisProduct.params[paramId] = {
            label: paramId.label,
            options: {},
          };
        }
        thisProduct.params[paramId].options[optionId] = option.label;
          
        if (optionSelected && !option.default) {
          price = price + option.price;
        } else if (!optionSelected && option.default) {
          price = price - option.price;
        }
        const images = document.querySelectorAll('.' + paramId + '-' + optionId);

        if (optionSelected) {
          for (let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  addToCart(){
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      }
    });

    thisProduct.element.dispatchEvent(event);
  }
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function() {
      thisProduct.processOrder();
    });
  }
}

export default Product;