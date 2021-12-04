// Temporary file to create a new blog post

// POST
() => {
  return fetch('/api/blogs', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: 'My Title', content: 'My Content' })
  }).then(res => res.json());
};

// Get
() => {
  return fetch('/api/blogs', {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
};
