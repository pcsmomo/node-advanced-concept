# node-advanced-concept

Node JS: Advanced Concepts by Stephen Grider

## Folder structure

- 03-project-setup
  - blog : main project
- After that blog project is copied from the previous lecture
  - and so is /config/dev.js as it is not included to git

# Details

[Part 1: Section 1-4](README-1.md)

<details open> 
  <summary>Click to Contract/Expend</summary>

## Section 5 - Automated Headless Browser Testing

### 71. Testing Flow

We will focus on "Integration Testing" \
Especially E2E (End to End), Automation testing

- Jest
- Chromium : "headless" version
  - Which is already included in node.js

### 72. Testing Challenges

1. Launch Chromium programatically and interact with it from a test suite
2. Make assertions in jest about stuff thats happening in a Chrome window
3. "Simulate" Logging in as a user? We're going through Google OAuth

### 73. Commands Around Testing

[npm peppeteer](https://www.npmjs.com/package/puppeteer)

- `"jest": "^22.1.4"`
- `"puppeteer": "^1.0.0"` : Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.

```sh
npm test
```

### 75. Launching Chromium Instances

1. Pepperteer: Start up Chromium
2. Browser: Represents an open browser window
3. Page: Represents one individual tab

### 77. Extracting Page Content

Pepperteer, Browser, Page all works asynchronously

### 78. Puppeteer - Behind the Scenes

Jest - |different world| - Chromium

So the communication between Jest and Chromium is only with plain strings.\
and there serialising step behind the scenes

```js
await page.$eval('a.brand-logo', el => el.innerHTML);
```

`el => el.innerHTML` will be send as plain string, not as a function

### 81. Asserting OAuth Flow

[puppeteer DOC](https://github.com/puppeteer/puppeteer/blob/v12.0.1/docs/api.md)

- page.click()
- page.url()

### 82. Asserting URL Domain

[Jest expect.toMatch](https://jestjs.io/docs/expect#tomatchregexp--string)

### 83. Issues with OAuth

Google OAuth will consider these suspicious and get us CAPTCHA \
(Completely Automated Public Turing test to tell Computers and Humans Apart)

1. Chromium - never accessed it before and there will be many different Chromium instances
2. CI/CD testing

</details>
