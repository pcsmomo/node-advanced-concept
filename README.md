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

### 98. Adding a Login Method

[Page Class in Peppeteer - Github](https://github.com/puppeteer/puppeteer/blob/v12.0.1/src/common/Page.ts#L417)

We could use the same approach as same as our caching section\
But we're in an advanced course, so we will use a clever and more fun way\
with ES2015 syntax, `Proxy`

### 99. Extending Page

[example 99-extending-page.js](05-testing/examples/99-extending-page.js)

### 100. Introduction to Proxies

[Proxy - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)

### 101. Proxies in Action

```js
// O, yup, this way with Proxy!
console.clear();

class Greetings {
  english() {
    return 'Hello';
  }
  spanish() {
    return 'Hola';
  }
}

class MoreGreetings {
  german() {
    return 'Hallo';
  }
  french() {
    return 'Bonjour';
  }
}

const greetings = new Greetings();
const moreGreetings = new MoreGreetings();

const allGreetings = new Proxy(greetings, {
  // target: greetings
  // property: string name of the property we try to access
  get: function (target, property) {
    return target[property] || moreGreetings[property];
    // return page[property] || customPage[property];
  }
});

console.log(allGreetings.french());
console.log(allGreetings.english());
```

```sh
npm test
```

### 102. Combining Object Property Access

[example 102-combine-object-property-access.js](05-testing/examples/102-combine-object-property-access.js)

### 105. Function Lookup Priority

The window didn't close\
because browser and page both have close()

### 111. Test Timeout

Timeout - Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout.

```js
jest.setTimeout(30000);
```

### 116. Asserting Blog Creation

```js
await page.waitFor('.card'); // we should wait when navigating to the other page
```

> ⚠️TypeError: Cannot create property '\_called' on number '10' \
> This error message didn't show up When running test case one by one with `test.only`\
> But running all tests together, this warning occurs.\
> Could not find a clear answer. Guessing this lecture is a bit outdated.\
> Latest version of jest and puppeteer might not have this issue??\
> https://stackoverflow.com/questions/63226326/jest-with-puppeteer-typeerror-cannot-create-property-called-on-number-11

```js
"jest": "^22.1.4", -> "27.4.3"
"puppeteer": "^1.0.0" -> "12.0.1",
```

### 118. Direct API Requests

- [example 118-direct-api-requests.js](./05-testing/examples/118-direct-api-requests.js)
  - Test this script on the browser, both logged in and loggin out
- [fetch() options - MDN](https://developer.mozilla.org/en-US/docs/Web/API/fetch)

### 119. Executed Arbitrary JS in Chromium

[page.evaluate() - puppeteer DOC](https://github.com/puppeteer/puppeteer/blob/v12.0.1/docs/api.md#pageevaluatepagefunction-args)

### 123. Super Advanced Test Helpers

1. Create helpers `get` and `post`
   - ```js
      // evaluate takes args as only strings, so it will occur an error
      get(path) {
        return this.page.evaluate(() => {
          return fetch(path, {});
        })
      };
      ⬇️⬇️⬇️
      get(path) {
        return this.page.evaluate((_path) => {
          return fetch(_path, {});
        }, path)
      };
     ```
2. Create a helper `execRequests`
   - [Promise.all() - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

> Unfortunately,
> ⚠️TypeError: Cannot create property '\_called' on number '10' \
> When running all tests together, this warning message occurs.\
> But When running test case one by one with `test.only` or `describe.only`, all test pass\

## Section 6 - Wiring Up Continuous Integration

### 124. Introduction to CI

CI Flow

1. Developer pushes code to github
2. CI Server detects that a new push of code has occured
3. CI Server clones project to a cloud-based virtual machine
4. CI Server runs all tests (using a `.travis.yml`)
5. if all tests pass, CI Server marks build as 'passing' and does some optional followup
6. (option) Send an email, automatically deploy, put notification on Github, etc...

### 125. CI Providers

- [Travis CI](https://travis-ci.com/)
- Circle CI
- Codeship
- AWS Codebuild

### 126. The Basics of YAML Files

```yaml
# .yaml
languagesIKnow:
  english: 'very well'
  spanish: 'kindof'
countToTwo:
  - 'one'
  - 'two'
```

```json
// .json
{
  "languagesIKnow": {
    "english": "very well",
    "spanish": "kindof"
  },
  "countToTwo": ["one", "two"]
}
```

### 127. Travis YAML Setup

[Travis CI Documentation](https://docs.travis-ci.com)
[Travis CI API - DOC](https://docs.travis-ci.com/api)

trusty: a very specific version of linux (very small and suitable for small app)

```yaml
script:
  - nohup npm run start &
```

- nohup : no hang up, keep this command running.
  - if the shell is closed, dont kill anything this command creates
- npm run start
- & : Run this command in a subshell(in the background)

```sh
npm run start &
# Listening on port 5000
pkill node
# [1]  + terminated  npm run start
cal
# Calendar
```

### 131. Using Travis Documentation

Set up for MongDB, Express API and Redis Server

- [Setting up Databases and Services - DOC](https://docs.travis-ci.com/user/database-setup/)
- [Setting up MongoDB - DOC](https://docs.travis-ci.com/user/database-setup/#mongodb)
- [Setting up Redis - DOC](https://docs.travis-ci.com/user/database-setup/#redis)

### 132. More Server Configuration

1. Add ci.js key file
2. Fix redix URL in services/cache.js
3. Add redis URL to dev.js and ci.js
4. Add mongoDB URI to ci.js
5. Make sure server starts on port 3000 in CI mode
6. Make sure server serves react client files in CI mode

### 134. A Touch More Configuration

```js
// tests/helpers/page.js
// Set up for CI
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox'] // it will dramatically decrease amount of time to test
});
```

### 135. Git Repo Setup

1. Create github repository, `blog-node-ci`
2. Set github uri
   - `git remote add origin git@github.com:pcsmomo/blog-node-ci.git`

### 136. Travis CI Setup

Um... travis-ci.org -> travis-ci.com

1. Create a new account in Travis ci
   - it automatically connected my github account
2. Activate my repository, `blog-node-ci`

### 137. Triggering CI Builds

```sh
git add -A
git commit -m"travis config"
git push
```

Navigate travis-ci.com, we can see the pushed commit is processing

### 138. Build Success

All pased!!

```sh
Ran all test suites.
The command "npm run test" exited with 0.

store build cache     cache.2

Done. Your build exited with 0.
/home/travis/.travis/functions: line 536:  6084 Terminated              nohup npm run start

# Ran for 7 min 48 sec
# Caching takes the longest time
```

## Section 7 - Scalable Image/File Upload

### 140. Big Issues Around Image Upload

1. Where do images get physically stored?
   1. in MongoDB(cloud): too expensive for storing images (bad approach)
   2. in HD Attached to Server
   3. \*Outside Data Store
2. How do images _get_ to the place they should be stored?
3. How do we relate images to a particular blog post?

### 143. Upload Constraints

1. (Express API) Only signed in users should be able to upload
2. (Express API) The uploaded image needs to be tied to the blog posts that's being created
3. We should only allow images (.jpg, .png, etc) to be uploaded

### 144. Image File Transport

When I upload image via Express API, it will use a lot resource of the node server (CPU usage is going up rapidly)

### 145. Upload Flow with AWS S3

1. Client -> Server : Client tells server it needs to upload a file to S3. Includes file name and file type
2. Server -> AWS S3 : Server askes S3 for a presigned URL
3. AWS S3 -> Server : S3 gives server a presigned URL. Works "only" for a file matching the original file name
4. Server -> Client : Server sends url to React client
5. Client -> Server : React client uploads image file directly to s3 server
6. Server -> Client : React client tells server the upload was successful. Server saves URL of that new image with the blog post

## 152. AWS Credentials with IAM

IAM: Identity and Access Management

### 153. Creating S3 Buckets

S3 -> Create bucket -> `blogster-bucket-noah`

### 154. Allowing Actions with IAM Policies

- IAM -> Policies -> Create Policy
  - Service: S3
  - Actions: All S3 actions
  - Resources
    - Bucket -> Add ARN -> Bucket name : blogster-bucket-noah
    - Object -> Add ARN -> Bucket name: blogster-bucket-noah, Object name: Check Any
  - Review
    - name: `s3-blogster-bucket`
  - Create policy

### 155. Creating IAM Users

- IAM -> User
  - Add user
    - User name: `s3-blogster-bucket`
    - Access key - Programmatic access : check
  - Permissions
    - Attach existing policies directly
    - select s3-blogster-bucket
  - My "Access key ID" and "Secret access key" will be appealed

And save "accessKeyId" and "secretAccessKey" on config/dev.js

### 156. Upload Routes Files

```sh
npm install --save aws-sdk
# it was included already, "aws-sdk": "^2.188.0",
```

### 158. GetSignedURL Arguments

- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/sdk-for-javascript/index.html)
- [Version 2](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html)
- [Version 3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html)

[AWS SDK S3 - getSignedUrl()](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property)

### 159. Calling GetSignedURL

```sh
npm install --save uuid
# "uuid": "^3.2.1" installed already
```

```js
app.get('/api/upload', requireLogin, (req, res) => {
  const key = `${req.user.id}/${uuid()}.jpeg`;

  s3.getSignedUrl(
    'putObject',
    {
      Bucket: 'blogster-bucket-noah',
      ContentType: 'jpeg',
      Key: key
    },
    (err, url) => res.send({ key, url })
  );
});
```

### 160. Viewing the Signed URL

Navigate `http://localhost:5000/api/upload`

### 161. Attempting Image Upload

CORS Error

Access to XMLHttpRequest at 'https://blogster-bucket-noah.s3.amazonaws.com/61abc0e87883a63b924a27c7/7658e8c0-56cf-11ec-936e-c12d647a5899.jpeg?AWSAccessKeyId=AKIAXQLRYDCS6OFMZNBX&Content-Type=image%2Fjpeg&Expires=1638821858&Signature=2%2FezCiUFt1dYC2f3DtwnyJVceMs%3D' from origin 'http://localhost:3000' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.

### 162. Handling CORS Errors

[CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)

```xml
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>Authorization</AllowedHeader>
  </CORSRule>
  <CORSRule>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
  </CORSRule>
</CORSConfiguration>
```

```json
[
  {
    "AllowedHeaders": ["Authorization"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  },
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["http://localhost:3000"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

And try to upload a image file

```
createError.js:16 Uncaught (in promise) Error: Request failed with status code 403
    at createError (createError.js:16)
    at settle (settle.js:18)
    at XMLHttpRequest.handleLoad (xhr.js:77)
```

> Damn... it accepts only 'jpeg', not 'png'. I was stuck here for 30 mins

</details>
