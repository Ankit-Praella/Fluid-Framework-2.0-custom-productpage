/**
* Product Form Components
*
*/
class ProductDetails extends HTMLElement {
  constructor() {
    super();
    var radioButtons = document.querySelectorAll("[option-data]");
    var selectOptions = document.querySelectorAll("[select_variants]")
    var items = document.querySelector("[ajaxcart]");
    this.updateEvents();
    if (radioButtons.length > 0) {
      this.variantRadios(radioButtons)
    }
    if(selectOptions.length > 0){
      this.variantSelect(selectOptions)
    }
    if(items != null){
      this.AjaxCart(items)
    }
  }
  updateEvents() {
    this.querySelectorAll('[data-qty-btn]').forEach(button => button.addEventListener('click', this.manageQuantity.bind(this)));
  }
  // Listen to radio button updates and trigger a function to identify the variant
  variantRadios(radioButtons) {
    var optionSelector = document.querySelectorAll("[option-data]");
    const jsonStr = document.getElementById("product-variant-json").textContent;
    const jsonData = JSON.parse(jsonStr); // Load all product data to an object
    console.log(jsonData);
    optionSelector.forEach(element => {
      element.addEventListener("change", (event) => {
        for (var radioButton of radioButtons) {
          if (radioButton.checked) {
            var data_indexno = radioButton.getAttribute("dataindex");
            quickShopSlider.slideTo(data_indexno, 1000);
            var selectedOption = radioButton.value;
            jsonData.variants.filter((variant) => {
              if (variant.title == selectedOption) {
                var variantId = variant.id;
                var productPrice = Shopify.formatMoney(variant.price);
                var productComparePrice = Shopify.formatMoney(variant.compare_at_price);
                document.querySelector("[actual_price]").innerHTML = `${productPrice}`;
                document.querySelector("[compare_at_price]").innerHTML = `${productComparePrice}`;
                if (variant.available === true) {
                  document.getElementById("add_cart").removeAttribute("disabled", "");
                  document.getElementById("add_cart").innerHTML = "ADD TO CART";
                  var updateVar = document.getElementById("add_cart");
                  updateVar.setAttribute("variant_id",variantId)
                } else {
                  document.getElementById("add_cart").setAttribute("disabled", "");
                  document.getElementById("add_cart").innerHTML = "Sold Out";
                }
              }
            })
          }
        }
      })
    })
  }  
  
  //variantSelect
  variantSelect(selectOptions){
    selectOptions.forEach(element=>{
      element.addEventListener("change",(event)=>{
        var varId = event.target.selectedOptions[0].getAttribute("variant-id");
        const jsonStr = document.getElementById("product-variant-json").textContent;
        const jsonData = JSON.parse(jsonStr);
        console.log(jsonData)
        var data_indexno = event.target.selectedOptions[0].getAttribute("data-indexno");
        quickShopSlider.slideTo(data_indexno, 1000);
        jsonData.variants.filter((variant) => {
          if (variant.id == varId) {
            var variantId = variant.id;
            console.log(variantId)
            var productPrice = Shopify.formatMoney(variant.price);
            var productComparePrice = Shopify.formatMoney(variant.compare_at_price);
            document.querySelector("[actual_price]").innerHTML = `${productPrice}`;
            document.querySelector("[compare_at_price]").innerHTML = `${productComparePrice}`;
            if (variant.available === true) {
              document.getElementById("add_cart").removeAttribute("disabled", "");
              document.getElementById("add_cart").innerHTML = "ADD TO CART";
              var updateVar = document.getElementById("add_cart");
              updateVar.setAttribute("variant_id",variantId)
            } else {
              document.getElementById("add_cart").setAttribute("disabled", "");
              document.getElementById("add_cart").innerHTML = "Sold Out";
            }
          }
        });
      })
    })
  }
  
  /**
  *  manageQuantity Item
  */
  manageQuantity(event) {
    event.preventDefault();
    let currentTarget = event.currentTarget;
    let targetName = event.currentTarget.getAttribute('quantity-box');
    let $qtyInputBox = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
    var currentQty = parseInt($qtyInputBox.value) || 1;
    let finalQty = 1;
    if (targetName == 'minus' && currentQty <= 1) {
      return false
    } else if (targetName == 'minus') {
      finalQty = currentQty - 1;
      $qtyInputBox.value = finalQty;
    } else {
      finalQty = currentQty + 1;
      $qtyInputBox.value = finalQty;
    }
  }
  /**
  *  addCart of Item
  */
  AjaxCart(items) {
    items.addEventListener("click", (event) => {
      var elementTarget = document.querySelector("variant-details"); 
      var quantityValue = elementTarget.querySelector("[data-qty-input]").value
      const targetElement = document.getElementById('add_cart');
      let currentvariantId = targetElement.getAttribute('variant_id');
      let formData = {
        items: [
          {
            id: currentvariantId,
            quantity: quantityValue,
          },
        ],
      };
      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      .then((response) => {
        document.getElementById("add_cart").classList.add("loading");
        if (response.status == 200) {
          let cartElementx = document.querySelector("ajax-cart");
          cartElementx.getCartData("open_drawer");
        }
        setTimeout(function () {
          document.querySelectorAll(".close-quickview").forEach((item) => {
            document.querySelector(".quick-modal").style.display = "none";
          });
        }, 100);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    });
  }
}
customElements.define("variant-details", ProductDetails)