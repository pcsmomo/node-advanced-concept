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

// X, Merit way but there would be a better way
class CustomPage {
  constructor(page) {
    this.page = page;
  }

  login() {
    console.log('this is login()');
    this.page.goto('localhost:3000');
    this.page.setCookie();
  }
}

const buildPage = () => {
  const page = new Page();
  const customPage = new CustomPage(page);

  const superPage = new Proxy(customPage, {
    get: function (target, property) {
      return target[property] || page[property];
    }
  });

  // superPage.goto();
  // superPage.setCookie();
  // superPage.login();

  return superPage;
};

buildPage();
