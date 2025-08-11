// Using private fields to create nominal types
class Password {
  private __nominal = undefined;
}

class HashedPassword {
  private __nominal = undefined;
}

// These are now incompatible types
const password = {} as Password;
const hashed = {} as HashedPassword;

// Type error - can't assign one to the other
const wrong: Password = hashed; // Error!
