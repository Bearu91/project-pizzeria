import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart {
  constructor(element) {
    const thisCart = this;
  
    thisCart.products = [];
  
    thisCart.getElements(element);
    thisCart.initActions();
  
    // console.log('new Cart', thisCart);
  
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
  
  }
  
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
  
    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
  }
  
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function () {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function () {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  
  add(menuProduct) {
  
    const thisCart = this;
  
    console.log('adding product', menuProduct);
  
    /* generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    // console.log('generatedHTML:', generatedHTML);
    /* create DOM variable using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    // console.log('generatedDOM', generatedDOM);
    /* add DOM elements to... */
    const cartContainer = thisCart.dom.productList;
    // thisCart.dom.productList(generatedDOM);
    cartContainer.appendChild(generatedDOM);
    // thisCart.products.push(menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }
  
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
  
    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('total numer', thisCart.totalNumber);
    console.log(thisCart.subtotalPrice);
    console.log(thisCart.totalPrice);
  
    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }
  }
  
  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  
  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
  
    const payload = {
      address: thisCart.dom.address.value,
      totalPrice: thisCart.totalPrice,
      phone: thisCart.dom.phone.value,
      number: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      delivery: thisCart.deliveryFee,
      products: []
    };
  
    for (let product of thisCart.products) {
      let orderProduct = product.getData();
      payload.products.push(orderProduct);
    }
  
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
  
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
}
export default Cart;