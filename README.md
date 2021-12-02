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

### 84. Solving Authentication Issues with Automation Testing

1. Make a secret route on the server that automatically logs in our Chromium browser
   - Bad practice to change our server code just to make our test suite work
2. When tests are running, don't require authentication of any kind
   - Server is running 100% separately from test suite. We can't easily change the server only when tests are running
3. Google might provide some fake accounts for testing
   - It works only for Google OAuth
4. \*Somehow convince our server that the Chromiun browser is logged into the app by faking a session
   - Let's try it!
   - It will work with any OAuth services, not only Google

### 85. The Google OAuth Flow

We will hook up these parts to our Chromium

- Server sets cookie on users browser that identifies them
- All feature requests include cookie data just identifies this user

### 86. Inner Workings of Sessions

See devTool, network tab when login via google OAuth

1. http://localhost:3000/auth/google/callback?code=4%2F0AX4XfWgZgpf507bO2vp94KzYgUW7Uq-ihvqhMk1y4GtNYzwKUKFyXKCQbjGMRdohJ7LvRQ&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&authuser=1&prompt=consent
   - Response Headers
     - set-cookies: session=eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjFhMzBmODkwMmVjNjMxYzA0NDZkMmU4In19; path=/; expires=Fri, 31 Dec 2021 20:09:05 GMT; httponly
     - set-cookies: session.sig=rHFEnnjJKe99pKyfbp1p6THMsGs; path=/; expires=Fri, 31 Dec 2021 20:09:05 GMT; httponly

```sh
# blog
node
const session = 'eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjFhMzBmODkwMmVjNjMxYzA0NDZkMmU4In19'
const Buffer = require('safe-buffer').Buffer;
Buffer.from(session, 'base64').toString('utf8');
# '{"passport":{"user":"61a30f8902ec631c0446d2e8"}}'
# The same user id(=mongodb id, not google id) in my mongodb
```

[safe-buffer npm](https://www.npmjs.com/package/safe-buffer)

So that 'session' value inside cookie is the key

### 87. Sessions From Another Angle

1. Create Page instance
2. Take an existing user ID and generate a fake session object with it
3. Sign in the sesion object with keygrip
4. Set the session and signature on our Page instance as cookies

### 88. Session Signatures

#### Session signature

session.sig : Session Signature

- Base64 Session + Cookie Signing Key = Session Signature
- Base64 Session = Cookie Signing Key + Session Signature

Our cookie key for development is located in config/dev.js

#### keygrip

[keygrip npm](https://www.npmjs.com/package/keygrip)

```sh
node
const session = 'eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNjFhMzBmODkwMmVjNjMxYzA0NDZkMmU4In19';
const Keygrip = require('keygrip');
const keygrip = new Keygrip(['123123123111']);
keygrip.sign('session=' + session);
# rHFEnnjJKe99pKyfbp1p6THMsGs
# Exactly the same signature as we get from the browser
# keygrip.sign('asacvjkzxcvlakf' + session);
keygrip.verify('session=' + session, 'rHFEnnjJKe99pKyfbp1p6THMsGs')
# true
```

### 92. Factory Functions

- Session Factory
- User Factory

When we call it, it automately assembles some data and returns immediately

### 93. The Session Factory

```js
// mongoose id is actually an object
passport: {
  user: user._id.toString();
}
```

### 96. Global Jest Setup

```js
// Tell mongoose to use node global.Promise instead of mongoose.Promise
// (it's legacy code now, from Mongoose 5, this statement isn't needed)
// https://stackoverflow.com/questions/51862570/mongoose-why-we-make-mongoose-promise-global-promise-when-setting-a-mongoo
mongoose.Promise = global.Promise;
```

```json
// package.json
{
  "jest": {
    "setupTestFrameworkScriptFile": "./tests/setup.js"
  }
}
```

[Configuring Jest - DOC](https://jestjs.io/docs/configuration)

</details>
