class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.posts = [];
  }

  addPost(post) {
    this.posts.push(post);
    return this.posts.length;
  }

  getPostCount() {
    return this.posts.length;
  }
}

module.exports = User;
