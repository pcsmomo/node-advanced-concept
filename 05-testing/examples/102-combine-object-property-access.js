console.clear();

class Page {
  goto() {
    console.log('Im going to another page');
  }
  setCookie() {
    console.log('Im setting a cookie');
  }
}

// X, we cannot easily tell peppeteer to use CustomPage instead of Page
// class CustomPage extends Page {
//   login() {
//     console.log('All of our login logic');
//   }
// }

// O, using Proxy. The Best Way!
class CustomPage {
  static build() {
    const page = new Page();
    const customPage = new CustomPage(page);

    const superPage = new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || page[property];
      }
    });

    return superPage;
  }

  constructor(page) {
    this.page = page;
  }

  login() {
    console.log('this is login()');
    this.page.goto('localhost:3000');
    this.page.setCookie();
  }
}

const superPage = CustomPage.build();

superPage.goto();
superPage.setCookie();
superPage.login();
