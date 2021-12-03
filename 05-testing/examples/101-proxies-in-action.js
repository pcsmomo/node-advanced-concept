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

const allGreetings = new Proxy(moreGreetings, {
  // target: moreGreetings
  // property: string name of the property we try to access
  get: function (target, property) {
    // console.log(property);
    return target[property] || greetings[property];
    // return page[property] || customPage[property];
  }
});

// console.log(allGreetings.french());
console.log(allGreetings.english());
// allGreetings.evenPropertiesThatDontExist;
