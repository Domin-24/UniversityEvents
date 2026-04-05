const User = require('../../src/models/User');

describe('models/User', () => {
  test('should initialize with name, email and empty posts', () => {
    // Arrange
    const name = 'Alice';
    const email = 'alice@example.com';

    // Act
    const user = new User(name, email);

    // Assert
    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
    expect(user.posts).toEqual([]);
    expect(user.getPostCount()).toBe(0);
  });

  test('should add post and return updated count', () => {
    // Arrange
    const user = new User('Bob', 'bob@example.com');

    // Act
    const count = user.addPost('My first post');

    // Assert
    expect(count).toBe(1);
    expect(user.posts).toEqual(['My first post']);
    expect(user.getPostCount()).toBe(1);
  });

  test('should keep correct count after multiple posts', () => {
    // Arrange
    const user = new User('Carol', 'carol@example.com');

    // Act
    user.addPost('Post 1');
    user.addPost('Post 2');

    // Assert
    expect(user.getPostCount()).toBe(2);
  });
});
