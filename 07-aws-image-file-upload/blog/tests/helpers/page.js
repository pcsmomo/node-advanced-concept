const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
  static async build() {
    // Set up for local dev
    // const browser = await puppeteer.launch({
    //   headless: false
    // });

    // Set up for CI
    // const browser = await puppeteer.launch({
    //   headless: true,
    //   args: ['--no-sandbox']
    // });

    let browser;
    if (['ci'].includes(process.env.NODE_ENV)) {
      // if (process.env.NODE_ENV === 'ci') {
      // Set up for CI
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
    } else {
      // } else if (process.env.NODE_ENV === 'test') {
      // Set up for local dev
      browser = await puppeteer.launch({
        headless: false
      });
    }

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage, {
      get: function (target, property) {
        return customPage[property] || browser[property] || page[property];
      }
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.page.setCookie({ name: 'session', value: session });
    await this.page.setCookie({ name: 'session.sig', value: sig });

    await this.page.goto('http://localhost:3000/blogs');
    await this.page.waitFor('a[href="/auth/logout"]'); // if test fails, it will hang here. waiting the logouts
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  get(path) {
    return this.page.evaluate(_path => {
      return fetch(_path, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json());
    }, path);
  }

  post(path, data) {
    return this.page.evaluate(
      (_path, _data) => {
        return fetch(_path, {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(_data)
        }).then(res => res.json());
      },
      path,
      data
    );
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, path, data }) => {
        return this[method](path, data);
      })
    );
  }
}

module.exports = CustomPage;
