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

- `"jest": "^22.1.4"`
- `"puppeteer": "^1.0.0"` : Puppeteer is a Node library which provides a high-level API to control Chrome or Chromium over the DevTools Protocol. Puppeteer runs headless by default, but can be configured to run full (non-headless) Chrome or Chromium.

```sh
npm test
```

</details>
