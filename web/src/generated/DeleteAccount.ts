export default {"1":function(container,depth0,helpers,partials,data) {
    return "        <!-- Success State -->\n        <div class=\"text-center\">\n          <div class=\"mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4\">\n            <svg class=\"h-8 w-8 text-green-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\"></path>\n            </svg>\n          </div>\n          <h1 class=\"text-3xl font-bold text-gray-900 mb-3\">Account Deleted Successfully</h1>\n          <p class=\"text-gray-600 mb-6\">\n            Your account and all associated data have been permanently deleted. We're sorry to see you go.\n          </p>\n          <a\n            href=\"/\"\n            class=\"inline-block bg-black hover:bg-gray-800 text-white font-medium px-8 py-3 rounded-xl transition-colors duration-200\"\n          >\n            Return to Home\n          </a>\n        </div>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <!-- Delete Account Form -->\n        <div class=\"text-center mb-8\">\n          <div class=\"mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4\">\n            <svg class=\"h-8 w-8 text-red-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n              <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z\"></path>\n            </svg>\n          </div>\n          <h1 class=\"text-3xl font-bold text-gray-900 mb-2\">Delete Your Account</h1>\n          <p class=\"text-gray-600\">This action cannot be undone. All your data will be permanently deleted.</p>\n        </div>\n\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"error") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":8},"end":{"line":44,"column":15}}})) != null ? stack1 : "")
    + "\n        <form>\n          <!-- Email -->\n          <div class=\"mb-5\">\n            <label for=\"email\" class=\"block text-sm font-medium text-gray-700 mb-2\">\n              Email Address\n            </label>\n            <input\n              type=\"email\"\n              id=\"email\"\n              name=\"email\"\n              required\n              autofocus\n              "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"email") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":14},"end":{"line":58,"column":51}}})) != null ? stack1 : "")
    + "\n              class=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 outline-none\"\n              placeholder=\"Enter your email\"\n            />\n          </div>\n\n          <!-- Password -->\n          <div class=\"mb-5\">\n            <label for=\"password\" class=\"block text-sm font-medium text-gray-700 mb-2\">\n              Password\n            </label>\n            <input\n              type=\"password\"\n              id=\"password\"\n              name=\"password\"\n              required\n              class=\"w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all duration-200 outline-none\"\n              placeholder=\"Enter your password\"\n            />\n          </div>\n\n          <!-- Confirmation Checkbox -->\n          <div class=\"mb-6\">\n            <label class=\"flex items-start cursor-pointer\">\n              <input\n                type=\"checkbox\"\n                id=\"confirmation\"\n                name=\"confirmation\"\n                required\n                class=\"mt-1 h-4 w-4 text-red-600 focus:ring-red-600 border-gray-300 rounded\"\n              />\n              <span class=\"ml-3 text-sm text-gray-700\">\n                I understand that I will delete my account and that this action cannot be undone\n              </span>\n            </label>\n          </div>\n\n          <!-- Error message container -->\n          <div id=\"form-error\" class=\"hidden mb-4 text-sm text-red-600\"></div>\n\n          <!-- Submit Button -->\n          <button\n            type=\"submit\"\n            hx-post=\"/api/delete-account\"\n            hx-include=\"#delete-form\"\n            hx-swap=\"outerHTML\"\n            hx-target=\"#delete-form\"\n            class=\"w-full bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600\"\n          >\n            Delete My Account Permanently\n          </button>\n        </form>\n\n        <div class=\"mt-6 text-center\">\n          <a href=\"/\" class=\"text-sm text-gray-600 hover:text-gray-900 transition-colors\">\n            Cancel and return to home\n          </a>\n        </div>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "          <div class=\"mb-6 bg-red-50 border border-red-200 rounded-xl p-4\">\n            <div class=\"flex items-start\">\n              <svg class=\"h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\">\n                <path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"></path>\n              </svg>\n              <p class=\"text-sm text-red-800\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"error") || (depth0 != null ? lookupProperty(depth0,"error") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"error","hash":{},"data":data,"loc":{"start":{"line":41,"column":46},"end":{"line":41,"column":55}}}) : helper)))
    + "</p>\n            </div>\n          </div>\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "value=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"email") || (depth0 != null ? lookupProperty(depth0,"email") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"email","hash":{},"data":data,"loc":{"start":{"line":58,"column":34},"end":{"line":58,"column":43}}}) : helper)))
    + "\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12\" id=\"delete-form\">\n  <div class=\"max-w-md w-full\">\n    <div class=\"bg-white rounded-2xl shadow-xl p-8\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"success") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":4,"column":6},"end":{"line":116,"column":13}}})) != null ? stack1 : "")
    + "    </div>\n\n    <!-- Footer -->\n    <div class=\"mt-8 text-center\">\n      <p class=\"text-sm text-gray-500\">\n        Aperto - Discover Monument Stories\n      </p>\n    </div>\n  </div>\n</div>\n\n<script>\n  // Client-side form validation\n  document.getElementById('delete-form')?.addEventListener('submit', function(e) {\n    const confirmation = document.getElementById('confirmation').checked;\n    const errorDiv = document.getElementById('form-error');\n\n    if (!confirmation) {\n      e.preventDefault();\n      errorDiv.textContent = 'You must confirm that you want to delete your account';\n      errorDiv.classList.remove('hidden');\n      return false;\n    }\n\n    errorDiv.classList.add('hidden');\n  });\n</script>\n";
},"useData":true};